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
  Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import { useCustomers, useDeleteCustomer } from '../hooks/useCustomers';
import { useNotification } from '../context/NotificationContext';
import { formatDate } from '../utils/formatters';

const CustomerList = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Query filters state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');

  // Deletion confirm state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');

  // Fetch customers
  const { data, isLoading, error } = useCustomers({
    page,
    limit,
    search: search || undefined,
  });

  // Delete customer mutation
  const deleteMutation = useDeleteCustomer();

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleDeleteClick = (id, email) => {
    setDeleteId(id);
    setDeleteName(email);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    
    try {
      await deleteMutation.mutateAsync(deleteId);
      showNotification(`Customer profile "${deleteName}" was successfully deleted.`, 'success');
    } catch (err) {
      showNotification(err.message || 'Failed to delete customer profile.', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const customersList = data?.data?.items || [];
  const totalCount = data?.data?.total || 0;
  const totalPages = data?.data?.pages || 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Top action welcome bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h3" fontWeight="700">
            Registered Customers
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage your profiles list, email domains, contact phones, and review purchase metrics.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/customers/add')}
        >
          Add Customer
        </Button>
      </Box>

      {/* Query Filters Paper */}
      <Paper sx={{ p: 2.5, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', borderRadius: 3, border: '1px solid #E2E8F0' }}>
        <TextField
          placeholder="Search Customer Email or Name..."
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
              <TableCell>Customer Details</TableCell>
              <TableCell>Email Address</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Joined Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              // Skeletons
              Array(5).fill(0).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Skeleton variant="text" width="60%" height={24} />
                  </TableCell>
                  <TableCell><Skeleton variant="text" width={160} /></TableCell>
                  <TableCell><Skeleton variant="text" width={120} /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell align="center"><Skeleton variant="circular" width={32} height={32} sx={{ mx: 'auto' }} /></TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="error" fontWeight="600">
                    Failed to load customer profiles: {error.message}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : customersList.length === 0 ? (
              // Empty State view
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Typography variant="h5" fontWeight="600" color="textSecondary" sx={{ mb: 1 }}>
                    No Customers Found
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Register a new customer profile to proceed with placing dynamic transaction orders.
                  </Typography>
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/customers/add')}>
                    Add First Customer
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              // Active Customer Rows
              customersList.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36, fontSize: '0.975rem', fontWeight: 600 }}>
                        {customer.first_name[0]}{customer.last_name[0]}
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight="600" color="#0F172A">
                        {customer.first_name} {customer.last_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell style={{ fontWeight: 500 }}>
                    {customer.email}
                  </TableCell>
                  <TableCell>
                    {customer.phone || '—'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.825rem' }}>
                    {formatDate(customer.created_at)}
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={1}>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => navigate(`/customers/edit/${customer.id}`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(customer.id, customer.email)}
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
      {!isLoading && !error && customersList.length > 0 && (
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

      {/* Delete Dialog Confirmation */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WarningIcon color="error" /> Delete Customer Profile?
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <DialogContentText>
            Are you sure you want to delete the customer profile belonging to <strong>"{deleteName}"</strong>? 
            This operation will permanently erase the customer profile. If they have already placed historical orders, the deletion will be blocked by system integrity controls.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerList;
