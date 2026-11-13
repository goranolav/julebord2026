import type { ReactNode } from 'react';
import { AppBar, Box, Container, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link as RouterLink } from 'react-router-dom';
import { no } from '../i18n/no';

interface PageLayoutProps {
  title: string;
  backTo?: string;
  actions?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | false;
  children: ReactNode;
}

export default function PageLayout({ title, backTo, actions, maxWidth = 'md', children }: PageLayoutProps) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 1 }}>
          {backTo && (
            <Tooltip title={no.common.back}>
              <IconButton component={RouterLink} to={backTo} edge="start" aria-label={no.common.back}>
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          )}
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1, fontWeight: 700 }} noWrap>
            {title}
          </Typography>
          {actions}
        </Toolbar>
      </AppBar>
      <Container maxWidth={maxWidth} sx={{ py: 4, flexGrow: 1 }}>
        {children}
      </Container>
    </Box>
  );
}
