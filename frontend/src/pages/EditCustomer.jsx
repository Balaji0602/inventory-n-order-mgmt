import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useCustomer, useUpdateCustomer } from '../hooks/useCustomers';
import { useNotification } from '../context/NotificationContext';

// Customer validation schema matching backend specifications
const customerSchema = zod.object({
  first_name: zod.string()
    .min(1, 'First Name is required')
    .max(100, 'First Name must not exceed 100 characters'),
  last_name: zod.string()
    .min(1, 'Last Name is required')
    .max(100, 'Last Name must not exceed 100 characters'),
  email: zod.string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must not exceed 255 characters'),
  phone: zod.string().optional().or(zod.literal('')),
});

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Queries
  const { data: customer, isLoading: isCustomerLoading, error: customerError } = useCustomer(id);
  const updateMutation = useUpdateCustomer(id);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerSchema),
  });

  // Pre-fill form when customer loads successfully
  useEffect(() => {
    if (customer) {
      reset({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
      });
    }
  }, [customer, reset]);

  const onSubmit = async (data) => {
    try {
      await updateMutation.mutateAsync({
        ...data,
        phone: data.phone || undefined,
      });
      showNotification(`Customer profile for "${data.first_name} ${data.last_name}" was successfully updated.`, 'success');
      navigate('/customers');
    } catch (error) {
      showNotification(error.message || 'Failed to update customer profile.', 'error');
    }
  };

  if (isCustomerLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (customerError) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h5" color="error" gutterBottom fontWeight="700">
          Failed to load Customer details
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          {customerError.message || 'Customer profile might not exist or network connection was aborted.'}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/customers')}>
          Back to Customers List
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 800, mx: 'auto', width: '100%' }}>
      {/* Action back row header */}
      <Box display="flex" alignItems="center" gap={1.5}>
        <IconButton onClick={() => navigate('/customers')} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h3" fontWeight="700">
            Edit Customer Profile
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Update names, email domain, or telephone number.
          </Typography>
        </Box>
      </Box>

      {/* Edit Form Card */}
      <Card sx={{ p: 4, borderRadius: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="first_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name *"
                    fullWidth
                    error={Boolean(errors.first_name)}
                    helperText={errors.first_name?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="last_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name *"
                    fullWidth
                    error={Boolean(errors.last_name)}
                    helperText={errors.last_name?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email Address *"
                    type="email"
                    fullWidth
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone Number"
                    fullWidth
                    error={Boolean(errors.phone)}
                    helperText={errors.phone?.message}
                  />
                )}
              />
            </Grid>

            {/* Form actions row */}
            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/customers')}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={updateMutation.isPending ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Customer'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>
    </Box>
  );
};

export default EditCustomer;
