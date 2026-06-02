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
import { useProduct, useUpdateProduct } from '../hooks/useProducts';
import { useNotification } from '../context/NotificationContext';

// Product schema validation rules matching backend specifications
const productSchema = zod.object({
  name: zod.string()
    .min(1, 'Product Name is required')
    .max(255, 'Product Name must not exceed 255 characters'),
  sku: zod.string()
    .min(3, 'SKU must be at least 3 characters')
    .max(100, 'SKU must not exceed 100 characters')
    .regex(/^[a-zA-Z0-9-_]+$/, 'SKU must contain only alphanumeric characters, dashes, or underscores'),
  description: zod.string().optional().or(zod.literal('')),
  price: zod.coerce.number()
    .positive('Price must be greater than zero')
    .multipleOf(0.01, 'Price must be in valid dollars and cents format'),
  stock_quantity: zod.coerce.number()
    .int('Stock must be a whole integer')
    .nonnegative('Stock quantity cannot be below zero'),
});

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Queries
  const { data: product, isLoading: isProductLoading, error: productError } = useProduct(id);
  const updateMutation = useUpdateProduct(id);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
  });

  // Pre-fill form when product loads successfully
  useEffect(() => {
    if (product) {
      reset({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        price: product.price || '',
        stock_quantity: product.stock_quantity ?? '',
      });
    }
  }, [product, reset]);

  const onSubmit = async (data) => {
    try {
      await updateMutation.mutateAsync({
        ...data,
        description: data.description || undefined,
      });
      showNotification(`Product "${data.name}" was successfully updated.`, 'success');
      navigate('/products');
    } catch (error) {
      showNotification(error.message || 'Failed to update product.', 'error');
    }
  };

  if (isProductLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (productError) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h5" color="error" gutterBottom fontWeight="700">
          Failed to load Product details
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          {productError.message || 'Product might not exist or connection was aborted.'}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/products')}>
          Back to Products Catalog
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 800, mx: 'auto', width: '100%' }}>
      {/* Action back row header */}
      <Box display="flex" alignItems="center" gap={1.5}>
        <IconButton onClick={() => navigate('/products')} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h3" fontWeight="700">
            Edit Catalog Product
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Update descriptions, unit pricing, or inventory numbers.
          </Typography>
        </Box>
      </Box>

      {/* Edit Form Card */}
      <Card sx={{ p: 4, borderRadius: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Product Name *"
                    fullWidth
                    error={Boolean(errors.name)}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="sku"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="SKU Code *"
                    fullWidth
                    error={Boolean(errors.sku)}
                    helperText={errors.sku?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Price ($) *"
                    type="number"
                    fullWidth
                    error={Boolean(errors.price)}
                    helperText={errors.price?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="stock_quantity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Stock Quantity *"
                    type="number"
                    fullWidth
                    error={Boolean(errors.stock_quantity)}
                    helperText={errors.stock_quantity?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    error={Boolean(errors.description)}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            {/* Form actions row */}
            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/products')}
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
                {updateMutation.isPending ? 'Updating...' : 'Update Product'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>
    </Box>
  );
};

export default EditProduct;
