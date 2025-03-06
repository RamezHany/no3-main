import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Image from 'next/image';
import { loadNewsData } from '@/components/home/home_news.data';
import { format } from 'date-fns';
import { MainLayout } from '@/components/layout';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import { useTranslation } from 'next-i18next';
import { GetStaticProps, GetStaticPaths } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { News } from '@/interfaces/News';

// Styled Paper for the News Detail Container
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    backgroundColor: theme.palette.background.paper,
    transition: 'box-shadow 0.3s ease-in-out',
    '&:hover': {
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    },
}));

const NewsDetail: FC = () => {
    const router = useRouter();
    const { slug } = router.query;
    const { t } = useTranslation('common');
    const { locale } = router;
    const [newsItem, setNewsItem] = useState<News | null>(null);
    const [currentLocale, setCurrentLocale] = useState<string | undefined>(locale);

    useEffect(() => {
        // Check if locale has changed
        if (currentLocale !== locale) {
            console.log(`Locale changed from ${currentLocale} to ${locale}`);
            setCurrentLocale(locale);
        }
        
        const loadNews = async () => {
            console.log(`Loading news data with locale: ${locale}`);
            const data = await loadNewsData(locale || 'en'); // Fetch data based on the current locale
            const item = data.find((item) => item.slug === slug);
            setNewsItem(item || null);
        };

        if (slug) {
            loadNews();
        }
    }, [locale, slug, currentLocale]); // Added currentLocale to dependencies

    if (!newsItem) {
        return (
            <MainLayout>
                <Container>
                    <Typography variant="h4" align="center" sx={{ my: 8 }}>
                        {t('news.notFound', 'الخبر غير موجود')}
                    </Typography>
                </Container>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Box component="article" sx={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', paddingTop: '40px' }}>
                <Box sx={{ py: { xs: 6, md: 10 } }}>
                    <Container maxWidth="lg">
                        <StyledPaper>
                            <Grid container spacing={4}>
                                {/* Title and Date */}
                                <Grid item xs={12}>
                                    <Typography
                                        variant="h1"
                                        component="h1"
                                        sx={{
                                            fontSize: { xs: 32, md: 48 },
                                            mb: 2,
                                            fontWeight: 'bold',
                                            color: 'primary.main',
                                            textAlign: 'center',
                                        }}
                                    >
                                        {newsItem.title}
                                    </Typography>
                                    <Typography
                                        variant="subtitle1"
                                        color="text.secondary"
                                        sx={{ mb: 4, textAlign: 'center' }}
                                    >
                                        {format(new Date(newsItem.date), 'dd/MM/yyyy')}
                                    </Typography>
                                    <Divider sx={{ mb: 4 }} />
                                </Grid>

                                {/* Main Image */}
                                {newsItem.image.slice(0, 1).map((img, index) => (
                                    <Grid item xs={12} key={index}>
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                height: { xs: 250, md: 500 },
                                                maxWidth: '1000px',
                                                margin: '0 auto',
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                transition: 'transform 0.3s ease-in-out',
                                                '&:hover': {
                                                    transform: 'scale(1.02)',
                                                },
                                            }}
                                        >
                                            <Image
                                                src={img.url}
                                                alt={`${newsItem.title} - صورة ${index + 1}`}
                                                width={800}
                                                height={600}
                                                priority
                                                style={{
                                                    objectFit: 'cover',
                                                    width: '100%',
                                                    height: '100%',
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                ))}

                                {/* Description */}
                                <Grid item xs={12}>
                                    <Box sx={{ mt: 4 }}>
                                        {newsItem.description.map((paragraph, index) => (
                                            <Typography
                                                key={index}
                                                sx={{
                                                    mb: 3,
                                                    color: 'text.secondary',
                                                    fontSize: '1.1rem',
                                                    lineHeight: 1.8,
                                                    textAlign: 'justify',
                                                }}
                                            >
                                                {paragraph}
                                            </Typography>
                                        ))}
                                    </Box>
                                </Grid>
                            </Grid>
                        </StyledPaper>
                    </Container>
                </Box>
            </Box>
        </MainLayout>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    // Fetch data to generate paths for both Arabic and English
    const responseAr = await fetch('https://raw.githubusercontent.com/RamezHany/IGCCe-tr/refs/heads/main/news_ar.json');
    const responseEn = await fetch('https://raw.githubusercontent.com/RamezHany/IGCCe-tr/refs/heads/main/news_en.json');
    const dataAr = await responseAr.json();
    const dataEn = await responseEn.json();

    const paths = [
        ...dataAr.news.map((news: News) => ({
            params: { slug: news.slug },
            locale: 'ar',
        })),
        ...dataEn.news.map((news: News) => ({
            params: { slug: news.slug },
            locale: 'en',
        })),
    ];

    return {
        paths,
        fallback: 'blocking', // Changed from false to 'blocking' to handle new slugs and locales
    };
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale || 'ar', ['common'])),
        },
    };
};

export default NewsDetail;