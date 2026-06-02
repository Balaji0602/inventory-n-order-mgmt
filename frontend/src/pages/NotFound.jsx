import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import ExploreOffIcon from '@mui/icons-material/ExploreOff';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexGrow={1}
      bgcolor="background.default"
      p={3}
    >
      <Paper
        elevation={0}
        sx={{
          p: 6,
          maxWidth: 500,
          textAlign: 'center',
          borderRadius: 4,
          border: '1px solid #E2E8F0',
        }}
      >
        <ExploreOffIcon color="primary" sx={{ fontSize: 72, mb: 2.5 }} />
        <Typography variant="h2" fontWeight="700" gutterBottom>
          404 - Page Not Found
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
        >
          Back to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound;
