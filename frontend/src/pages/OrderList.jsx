import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Pagination,
  Skeleton,
  InputAdornment,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningIcon from '@mui/icons-material/Warning';
import { useOrders, useDeleteOrder } from '../hooks/useOrders';
import { useNotification } from '../context/NotificationContext';
import { formatCurrency, formatDate } from '../utils/formatters';

const OrderList = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Query filters state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');

  // Cancel order state
  const [cancelId, setCancelId] = useState(null);

  // Fetch orders
  const { data, isLoading, error } = useOrders({
    page,
    limit,
    search: search || undefined,
  });

  // Delete/Cancel order mutation
  const cancelMutation = useDeleteOrder();

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleCancelClick = (id) => {
    setCancelId(id);
  };

  const handleCancelConfirm = async () => {
    if (!cancelId) return;
    
    try {
      await cancelMutation.mutateAsync(cancelId);
      showNotification('Order transaction was successfully cancelled and deleted. Stock counts were restored.', 'success');
    } catch (err) {
      showNotification(err.message || 'Failed to cancel order.', 'error');
    } finally {
      setCancelId(null);
    }
  };

  const ordersList = data?.data?.items || [];
  const totalCount = data?.data?.total || 0;
  const totalPages = data?.data?.pages || 0;

  // Visual status chip styling mapping
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
        size="small"
        sx={{ fontWeight: 600, borderRadius: 1.5 }}
      />
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Top action welcome bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h3" fontWeight="700">
            Placed Orders
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Review your transactional history logs, current orders processing statuses, and view detail invoices.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/orders/create')}
        >
          Create Order
        </Button>
      </Box>

      {/* Query Filters Paper */}
      <Paper sx={{ p: 2.5, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', borderRadius: 3, border: '1px solid #E2E8F0' }}>
        <TextField
          placeholder="Search by Status (e.g. Pending, Completed)..."
          value={search}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, minWidth: 240 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Tabular Container */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Invoice ID</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Client Details</TableCell>
              <TableCell align="right">Total Amount</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              // Skeletons
              Array(5).fill(0).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton variant="text" width={140} /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="text" width={160} /></TableCell>
                  <TableCell align="right"><Skeleton variant="text" width={80} sx={{ ml: 'auto' }} /></TableCell>
                  <TableCell align="center"><Skeleton variant="rectangular" width={70} height={24} sx={{ mx: 'auto', borderRadius: 1 }} /></TableCell>
                  <TableCell align="center"><Skeleton variant="circular" width={32} height={32} sx={{ mx: 'auto' }} /></TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="error" fontWeight="600">
                    Failed to load order logs: {error.message}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : ordersList.length === 0 ? (
              // Empty State view
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography variant="h5" fontWeight="600" color="textSecondary" sx={{ mb: 1 }}>
                    No Orders Placed Yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Establish your first order transaction and reduce your stock items inventory dynamically.
                  </Typography>
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/orders/create')}>
                    Create First Order
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              // Active Order Rows
              ordersList.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace" fontWeight="600" color="primary.main">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.825rem' }}>
                    {formatDate(order.order_date)}
                  </TableCell>
                  <TableCell>
                    {order.customer ? (
                      <Box>
                        <Typography variant="subtitle2" fontWeight="600" color="#0F172A">
                          {order.customer.first_name} {order.customer.last_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {order.customer.email}
                        </Typography>
                      </Box>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell align="right" style={{ fontWeight: 700, color: '#0F172A' }}>
                    {formatCurrency(order.total_amount)}
                  </TableCell>
                  <TableCell align="center">
                    {getStatusChip(order.status)}
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={1}>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => navigate(`/orders/details/${order.id}`)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleCancelClick(order.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      {!isLoading && !error && ordersList.length > 0 && (
        <Box display="flex" justifyContent="space-between" alignItems="center" px={1}>
          <Typography variant="caption" color="textSecondary">
            Showing Page {page} of {totalPages} | Total records matching filters: {totalCount}
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      {/* Cancel confirm dialog */}
      <Dialog open={Boolean(cancelId)} onClose={() => setCancelId(null)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WarningIcon color="error" /> Cancel Order Transaction?
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <DialogContentText>
            Are you sure you want to cancel and delete this order transaction? 
            This will permanently remove the order record, and **automatically restore the product stock quantities** inside the database inventory.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelId(null)} color="inherit">
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

export default OrderList;
