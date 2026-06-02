import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Grid,
  CircularProgress,
  IconButton,
  Button,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useOrder, useDeleteOrder } from '../hooks/useOrders';
import { useNotification } from '../context/NotificationContext';
import { formatCurrency, formatDate } from '../utils/formatters';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Queries
  const { data: order, isLoading: isOrderLoading, error: orderError } = useOrder(id);
  const cancelMutation = useDeleteOrder();

  // Cancel modal trigger
  const [cancelOpen, setCancelOpen] = useState(false);

  const handleCancelConfirm = async () => {
    try {
      await cancelMutation.mutateAsync(id);
      showNotification('Order transaction was successfully cancelled. Stock levels restored.', 'success');
      navigate('/orders');
    } catch (err) {
      showNotification(err.message || 'Failed to cancel order.', 'error');
    } finally {
      setCancelOpen(false);
    }
  };

  if (isOrderLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (orderError) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h5" color="error" gutterBottom fontWeight="700">
          Failed to load Order details
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          {orderError.message || 'Order record might not exist or network connection timed out.'}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/orders')}>
          Back to Orders List
        </Button>
      </Box>
    );
  }

  // Visual status chip
  const getStatusChip = (status) => {
    const cleanStatus = status ? status.toUpperCase() : 'PENDING';
    let color = 'warning';
    
    if (cleanStatus === 'COMPLETED') color = 'success';
    if (cleanStatus === 'CANCELLED') color = 'error';
    if (cleanStatus === 'PROCESSING') color = 'info';

    return (
      <Chip
        label={cleanStatus}
        color={color}
        sx={{ fontWeight: 600, borderRadius: 1.5 }}
      />
    );
  };

  const customer = order.customer || {};
  const items = order.items || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 900, mx: 'auto', width: '100%' }}>
      {/* Action back row header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconButton onClick={() => navigate('/orders')} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h3" fontWeight="700" display="inline-flex" alignItems="center" gap={1.5}>
              Invoice #{order.id.slice(0, 8).toUpperCase()}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              Placed date: {formatDate(order.order_date)}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          {getStatusChip(order.status)}
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setCancelOpen(true)}
          >
            Cancel Order
          </Button>
        </Box>
      </Box>

      {/* Invoice metadata grid */}
      <Grid container spacing={3}>
        {/* Customer Information Billing Card */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ p: 4, borderRadius: 3, height: '100%', boxSizing: 'border-box' }}>
            <Typography variant="h5" fontWeight="700" sx={{ mb: 2.5 }}>
              Customer Details
            </Typography>
            <Divider sx={{ mb: 2.5 }} />

            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Name</Typography>
                <Typography variant="body1" fontWeight="600" color="#0F172A">
                  {customer.first_name} {customer.last_name}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2">{customer.email}</Typography>
              </Box>

              {customer.phone && (
                <Box display="flex" alignItems="center" gap={1}>
                  <PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2">{customer.phone}</Typography>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Invoice Metadata Card */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ p: 4, borderRadius: 3, height: '100%', boxSizing: 'border-box' }}>
            <Typography variant="h5" fontWeight="700" sx={{ mb: 2.5 }}>
              Invoice Overview
            </Typography>
            <Divider sx={{ mb: 2.5 }} />

            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Invoice reference ID</Typography>
                <Typography variant="body2" fontFamily="monospace" fontWeight="600" color="primary.main">
                  {order.id}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2">{formatDate(order.order_date)}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Order Status</Typography>
                <Typography variant="body1" fontWeight="600" color={order.status === 'CANCELLED' ? 'error.main' : 'success.main'}>
                  {order.status}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Invoice Purchase Items list Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product Item</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Unit Price (Snapshot)</TableCell>
              <TableCell align="right">Subtotal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => {
              const prod = item.product || {};
              const subtotal = parseFloat(item.unit_price) * item.quantity;
              
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600" color="#0F172A">
                      {prod.name || 'Unknown Product'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace" bgcolor="#F1F5F9" px={1} py={0.5} borderRadius={1} display="inline-block">
                      {prod.sku || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" style={{ fontWeight: 500 }}>
                    {item.quantity}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(item.unit_price)}
                  </TableCell>
                  <TableCell align="right" style={{ fontWeight: 600, color: '#0F172A' }}>
                    {formatCurrency(subtotal)}
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Total aggregation rows */}
            <TableRow>
              <TableCell colSpan={3} border={0} />
              <TableCell align="right" sx={{ fontWeight: 700, borderBottom: 'none' }}>
                Invoice Total:
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1.25rem', borderBottom: 'none' }}>
                {formatCurrency(order.total_amount)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Cancellation Dialog Confirmation */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WarningIcon color="error" /> Cancel Order Transaction?
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <DialogContentText>
            Are you sure you want to cancel and delete this order transaction #{order.id.slice(0, 8).toUpperCase()}? 
            This will permanently remove this invoice record, and **automatically restore product stock quantities** back to the catalog inventory.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)} color="inherit">
            Go Back
          </Button>
          <Button
            onClick={handleCancelConfirm}
            color="error"
            variant="contained"
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? 'Processing...' : 'Confirm Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetail;
