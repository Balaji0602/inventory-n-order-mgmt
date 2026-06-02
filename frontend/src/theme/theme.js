import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB', // Vibrant Blue
      light: '#60A5FA',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7C3AED', // Premium Violet
      light: '#A78BFA',
      dark: '#5B21B6',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#16A34A', // Forest Green
      light: '#4ADE80',
      dark: '#15803D',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F59E0B', // Amber
      light: '#FBBF24',
      dark: '#B45309',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#DC2626', // Crimson Red
      light: '#F87171',
      dark: '#991B1B',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC', // Sleek slate white background
      paper: '#FFFFFF',   // Card / Sheet papers
    },
    text: {
      primary: '#0F172A',   // Slate-900
      secondary: '#475569', // Slate-600
      disabled: '#94A3B8',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      color: '#0F172A',
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.875rem',
      lineHeight: 1.25,
      letterSpacing: '-0.01em',
      color: '#0F172A',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      color: '#0F172A',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      color: '#0F172A',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#0F172A',
    },
    h6: {
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#0F172A',
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#475569',
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.57,
      color: '#475569',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      color: '#475569',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      color: '#475569',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none', // Prevents loud default uppercase labels
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 12, // Smooth, modern SaaS rounded borders
  },
  shadows: [
    'none',
    '0px 1px 2px 0px rgba(15, 23, 42, 0.05)',
    '0px 4px 6px -1px rgba(15, 23, 42, 0.05), 0px 2px 4px -2px rgba(15, 23, 42, 0.05)',
    '0px 10px 15px -3px rgba(15, 23, 42, 0.05), 0px 4px 6px -4px rgba(15, 23, 42, 0.05)',
    '0px 20px 25px -5px rgba(15, 23, 42, 0.05), 0px 8px 10px -6px rgba(15, 23, 42, 0.05)',
    ...Array(20).fill('none'), // Pad remainder to retain MUI standard shadow arrays length
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(37, 99, 235, 0.15)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1D4ED8 0%, #172554 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5B21B6 0%, #4C1D95 100%)',
          },
        },
        outlined: {
          border: '1px solid #E2E8F0',
          color: '#475569',
          background: '#FFFFFF',
          '&:hover': {
            background: '#F8FAFC',
            border: '1px solid #CBD5E1',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #E2E8F0',
          boxShadow: '0px 1px 3px 0px rgba(15, 23, 42, 0.05)',
          borderRadius: 12,
          padding: 24,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #F1F5F9',
          padding: '16px 24px',
          color: '#475569',
        },
        head: {
          fontWeight: 600,
          color: '#0F172A',
          backgroundColor: '#F8FAFC',
          borderBottom: '2px solid #E2E8F0',
          padding: '12px 24px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            backgroundColor: '#F8FAFC',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
            '& fieldset': {
              borderColor: '#E2E8F0',
            },
            '&:hover fieldset': {
              borderColor: '#CBD5E1',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563EB',
              borderWidth: '1px',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          padding: 16,
          border: '1px solid #E2E8F0',
          boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '1.25rem',
          color: '#0F172A',
          padding: '16px 24px 8px 24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '8px 24px 16px 24px',
        },
      },
    },
  },
});

export default theme;
