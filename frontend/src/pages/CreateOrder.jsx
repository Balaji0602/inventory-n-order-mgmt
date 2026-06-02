import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Button,
  Grid,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormHelperText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useCustomers } from '../hooks/useCustomers';
import { useProducts } from '../hooks/useProducts';
import { useCreateOrder } from '../hooks/useOrders';
import { useNotification } from '../context/NotificationContext';
import { formatCurrency } from '../utils/formatters';

const CreateOrder = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Queries and mutations
  const { data: customersData, isLoading: isCustomersLoading } = useCustomers({ limit: 100 });
  const { data: productsData, isLoading: isProductsLoading } = useProducts({ limit: 100 });
  const createOrderMutation = useCreateOrder();

  // Local form states
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);
  const [errors, setErrors] = useState({});

  const customers = customersData?.data?.items || [];
  const products = productsData?.data?.items || [];

  const handleAddLine = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveLine = (index) => {
    const updated = [...orderItems];
    updated.splice(index, 1);
    setOrderItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...orderItems];
    updated[index][field] = value;
    
    // Reset quantities if changing product
    if (field === 'product_id') {
      updated[index].quantity = 1;
    }
    
    setOrderItems(updated);
    
    // Clear validation error on change
    if (errors[index]?.[field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[index][field];
      setErrors(updatedErrors);
    }
  };

  // Helper calculating line totals
  const calculateLineSubtotal = (item) => {
    if (!item.product_id) return 0;
    const prod = products.find((p) => p.id === item.product_id);
    return prod ? parseFloat(prod.price) * item.quantity : 0;
  };

  // Helper calculating total aggregates
  const calculateTotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + calculateLineSubtotal(item), 0);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!selectedCustomerId) {
      newErrors.customer_id = 'Customer selection is required';
      isValid = false;
    }

    orderItems.forEach((item, idx) => {
      const lineErrors = {};
      if (!item.product_id) {
        lineErrors.product_id = 'Product selection is required';
        isValid = false;
      } else {
        const prod = products.find((p) => p.id === item.product_id);
        if (prod) {
          if (item.quantity <= 0) {
            lineErrors.quantity = 'Quantity must exceed 0';
            isValid = false;
          } else if (item.quantity > prod.stock_quantity) {
            lineErrors.quantity = `Insufficient stock (max ${prod.stock_quantity})`;
            isValid = false;
          }
        }
      }
      if (Object.keys(lineErrors).length > 0) {
        newErrors[idx] = lineErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showNotification('Please correct validation errors on product lines.', 'warning');
      return;
    }

    // Map request structure
    const payload = {
      customer_id: selectedCustomerId,
      items: orderItems.map((item) => ({
        product_id: item.product_id,
        quantity: parseInt(item.quantity, 10),
      })),
    };

    try {
      await createOrderMutation.mutateAsync(payload);
      showNotification('Order placed successfully. Inventory stock levels updated.', 'success');
      navigate('/orders');
    } catch (err) {
      showNotification(err.message || 'Failed to place order transaction.', 'error');
    }
  };

  const isLoading = isCustomersLoading || isProductsLoading;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 1000, mx: 'auto', width: '100%' }}>
      {/* Action back row header */}
      <Box display="flex" alignItems="center" gap={1.5}>
        <IconButton onClick={() => navigate('/orders')} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h3" fontWeight="700">
            Create Order
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Establish a transaction order, bind client data, select multiple items, and automatically deduct catalog stocks.
          </Typography>
        </Box>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Left panel: Customer selection & Items collection */}
          <Grid item xs={12} md={8} display="flex" flexDirection="column" gap={3}>
            {/* Customer Bind Panel */}
            <Card sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" fontWeight="700" sx={{ mb: 3 }}>
                Customer Bind
              </Typography>
              
              <FormControl fullWidth size="small" error={Boolean(errors.customer_id)}>
                <InputLabel>Target Customer Profile *</InputLabel>
                <Select
                  value={selectedCustomerId}
                  label="Target Customer Profile *"
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    if (errors.customer_id) {
                      const updated = { ...errors };
                      delete updated.customer_id;
                      setErrors(updated);
                    }
                  }}
                >
                  {customers.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.first_name} {c.last_name} ({c.email})
                    </MenuItem>
                  ))}
                </Select>
                {errors.customer_id && <FormHelperText>{errors.customer_id}</FormHelperText>}
              </FormControl>
            </Card>

            {/* Products selection lines panel */}
            <Card sx={{ p: 4, borderRadius: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="700">
                  Product Purchase Lines
                </Typography>
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAddLine}>
                  Add Line
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />

              {orderItems.map((item, index) => {
                const selectedProd = products.find((p) => p.id === item.product_id);
                const maxStock = selectedProd ? selectedProd.stock_quantity : 0;
                const unitPrice = selectedProd ? selectedProd.price : 0;

                return (
                  <Box key={index} sx={{ mb: index < orderItems.length - 1 ? 4 : 0 }}>
                    <Grid container spacing={2} alignItems="center">
                      {/* Product drop selection */}
                      <Grid item xs={12} sm={5}>
                        <FormControl fullWidth size="small" error={Boolean(errors[index]?.product_id)}>
                          <InputLabel>Product *</InputLabel>
                          <Select
                            value={item.product_id}
                            label="Product *"
                            onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                          >
                            {products.map((p) => (
                              <MenuItem key={p.id} value={p.id} disabled={p.stock_quantity === 0}>
                                {p.name} (SKU: {p.sku}) — {formatCurrency(p.price)}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors[index]?.product_id && <FormHelperText>{errors[index].product_id}</FormHelperText>}
                        </FormControl>
                        {selectedProd && (
                          <Typography variant="caption" color={maxStock < 10 ? 'error' : 'success.main'} fontWeight="600" sx={{ mt: 0.5, display: 'block' }}>
                            Available stock: {maxStock} units
                          </Typography>
                        )}
                      </Grid>

                      {/* Quantity input */}
                      <Grid item xs={6} sm={3}>
                        <TextField
                          label="Qty *"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value, 10) || 1)}
                          disabled={!item.product_id}
                          error={Boolean(errors[index]?.quantity)}
                          helperText={errors[index]?.quantity}
                          inputProps={{ min: 1 }}
                        />
                      </Grid>

                      {/* Subtotal line output */}
                      <Grid item xs={4} sm={3} textAlign="right">
                        <Typography variant="body2" color="textSecondary">
                          Subtotal
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="700" color="#0F172A">
                          {formatCurrency(calculateLineSubtotal(item))}
                        </Typography>
                      </Grid>

                      {/* Delete line action */}
                      <Grid item xs={2} sm={1} textAlign="center">
                        <IconButton
                          color="error"
                          disabled={orderItems.length === 1}
                          onClick={() => handleRemoveLine(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                );
              })}
            </Card>
          </Grid>

          {/* Right panel: Summary Invoice panel */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 4, borderRadius: 3, border: '1px solid #E2E8F0', position: 'sticky', top: 88 }}>
              <Typography variant="h5" fontWeight="700" sx={{ mb: 3 }}>
                Order Summary
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box display="flex" flexDirection="column" gap={2} sx={{ mb: 4 }}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">Line Items Count</Typography>
                  <Typography variant="subtitle2" fontWeight="600">{orderItems.length} lines</Typography>
                </Box>
                
                <Divider sx={{ borderColor: '#F1F5F9' }} />

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h4" fontWeight="700">Total Amount</Typography>
                  <Typography variant="h3" fontWeight="700" color="primary.main">
                    {formatCurrency(calculateTotalAmount())}
                  </Typography>
                </Box>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                startIcon={createOrderMutation.isPending ? <CircularProgress size={20} /> : <ShoppingBagIcon />}
                disabled={createOrderMutation.isPending || orderItems.length === 0}
              >
                {createOrderMutation.isPending ? 'Placing Order...' : 'Confirm Order Checkout'}
              </Button>
            </Card>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default CreateOrder;
