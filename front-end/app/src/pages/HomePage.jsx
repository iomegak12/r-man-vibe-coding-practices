// Home Page - Landing page with animated sections
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import CloudIcon from '@mui/icons-material/Cloud';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { ROUTES } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';
import { TopNavigation } from '../components/common/AppBar/TopNavigation';

// Animated Section Component
const AnimatedSection = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [delay]);

  return (
    <Box
      ref={sectionRef}
      sx={{
        width: '100%',
        height: '100%',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      }}
    >
      {children}
    </Box>
  );
};

export const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useMuiTheme();

  const features = [
    {
      icon: <PeopleIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Customer Management',
      description: 'Comprehensive customer database with detailed profiles, activity tracking, and intelligent segmentation.',
      benefits: ['360° Customer View', 'Smart Segmentation', 'Activity Tracking'],
    },
    {
      icon: <ShoppingCartIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Order Management',
      description: 'End-to-end order processing with real-time tracking, automated workflows, and comprehensive reporting.',
      benefits: ['Real-time Tracking', 'Automated Workflows', 'Multi-status Support'],
    },
    {
      icon: <FeedbackIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Complaint Resolution',
      description: 'Streamlined complaint handling with priority management, SLA tracking, and resolution analytics.',
      benefits: ['Priority Management', 'SLA Tracking', 'Resolution Analytics'],
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Secure & Scalable',
      description: 'Enterprise-grade security with JWT authentication, role-based access, and cloud-ready architecture.',
      benefits: ['JWT Security', 'Role-based Access', 'Cloud Ready'],
    },
  ];

  const services = [
    { name: 'Authentication Service', port: '5001', description: 'User authentication & authorization' },
    { name: 'Customer Service', port: '5002', description: 'Customer data management' },
    { name: 'Order Service', port: '5003', description: 'Order processing & tracking' },
    { name: 'Complaint Service', port: '5004', description: 'Complaint handling & resolution' },
  ];

  const benefits = [
    'Streamlined Operations',
    'Real-time Analytics',
    'Automated Workflows',
    'Scalable Infrastructure',
    'Data-driven Insights',
    'Enhanced Customer Experience',
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <TopNavigation />

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: { xs: 8, md: 16 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <AnimatedSection>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography variant="h2" sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                  Trade Management, Simplified
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, opacity: 0.95, fontWeight: 300 }}>
                  Powerful microservices platform for managing customers, orders, and complaints with enterprise-grade reliability.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {isAuthenticated ? (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate(ROUTES.DASHBOARD)}
                      sx={{
                        backgroundColor: 'white',
                        color: 'primary.main',
                        py: 1.5,
                        px: 4,
                        fontSize: '1.1rem',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
                      }}
                    >
                      Go to Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate(ROUTES.REGISTER)}
                        sx={{
                          backgroundColor: 'white',
                          color: 'primary.main',
                          py: 1.5,
                          px: 4,
                          fontSize: '1.1rem',
                          '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
                        }}
                      >
                        Get Started
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate(ROUTES.LOGIN)}
                        sx={{
                          borderColor: 'white',
                          color: 'white',
                          py: 1.5,
                          px: 4,
                          fontSize: '1.1rem',
                          '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' },
                        }}
                      >
                        Sign In
                      </Button>
                    </>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    width: '100%',
                    height: 300,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 4,
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 120, opacity: 0.5 }} />
                </Box>
              </Grid>
            </Grid>
          </AnimatedSection>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="xl" sx={{ py: { xs: 8, md: 12 } }}>
        <AnimatedSection>
          <Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 2 }}>
            Platform Features
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6, fontWeight: 300 }}>
            Everything you need to manage your trade operations efficiently
          </Typography>
        </AnimatedSection>

        <Grid container spacing={3} sx={{ maxWidth: 1400, mx: 'auto' }}>
          {features.map((feature, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6}
              key={index} 
              sx={{ 
                display: 'flex',
              }}
            >
              <AnimatedSection delay={index * 100}>
                <Card
                  sx={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      {feature.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {feature.benefits.map((benefit, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main' }} />
                          <Typography variant="body2" color="text.secondary">
                            {benefit}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Microservices Architecture Section */}
      <Box sx={{ backgroundColor: 'background.paper', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <AnimatedSection>
            <Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 2 }}>
              Microservices Architecture
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6, fontWeight: 300 }}>
              Four specialized services working together seamlessly
            </Typography>
          </AnimatedSection>

          <Grid container spacing={3}>
            {services.map((service, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <AnimatedSection delay={index * 100}>
                  <Card
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      border: '2px solid transparent',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Chip
                        label={`Port ${service.port}`}
                        color="primary"
                        size="small"
                        sx={{ mb: 2, fontWeight: 600 }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {service.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {service.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <AnimatedSection>
          <Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 2 }}>
            Why Choose TradeEase?
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6, fontWeight: 300 }}>
            Built for performance, designed for growth
          </Typography>
        </AnimatedSection>

        <Grid container spacing={3}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <AnimatedSection delay={index * 80}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '& .benefit-icon': { color: 'white' },
                    },
                  }}
                >
                  <CheckCircleIcon className="benefit-icon" sx={{ fontSize: 32, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {benefit}
                  </Typography>
                </Box>
              </AnimatedSection>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="md">
          <AnimatedSection>
            <Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 3 }}>
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" align="center" sx={{ mb: 4, opacity: 0.95, fontWeight: 300 }}>
              Join thousands of businesses streamlining their trade operations with TradeEase
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              {!isAuthenticated && (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate(ROUTES.REGISTER)}
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    py: 1.5,
                    px: 5,
                    fontSize: '1.1rem',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
                  }}
                >
                  Create Free Account
                </Button>
              )}
            </Box>
          </AnimatedSection>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ backgroundColor: 'background.paper', py: 4, borderTop: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} TradeEase. All rights reserved. | Built with modern microservices architecture
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};
