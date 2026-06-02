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
  MenuItem,
  Divider,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import { useProducts, useDeleteProduct } from '../hooks/useProducts';
import { useNotification } from '../context/NotificationContext';
import { formatCurrency } from '../utils/formatters';

const ProductList = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Query filters state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  // Deletion confirm state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');

  // Fetch products
  const { data, isLoading, error } = useProducts({
    page,
    limit,
    search: search || undefined,
    sort_by: sortBy,
    sort_dir: sortDir,
  });

  // Delete product mutation
  const deleteMutation = useDeleteProduct();

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // reset to first page on search
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const handleSortDirChange = (e) => {
    setSortDir(e.target.value);
    setPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleDeleteClick = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    
    try {
      await deleteMutation.mutateAsync(deleteId);
      showNotification(`Product "${deleteName}" was successfully deleted.`, 'success');
    } catch (err) {
      showNotification(err.message || 'Failed to delete product.', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const productsList = data?.data?.items || [];
  const totalCount = data?.data?.total || 0;
  const totalPages = data?.data?.pages || 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Top action welcome bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h3" fontWeight="700">
            Catalog Products
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage your stock descriptions, SKU codes, item unit prices, and inventory counts.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/products/add')}
        >
          Add Product
        </Button>
      </Box>

      {/* Query Filters Paper */}
      <Paper sx={{ p: 2.5, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', borderRadius: 3, border: '1px solid #E2E8F0' }}>
        <TextField
          placeholder="Search SKU or Name..."
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

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} label="Sort By" onChange={handleSortChange}>
            <MenuItem value="created_at">Date Created</MenuItem>
            <MenuItem value="name">Product Name</MenuItem>
            <MenuItem value="sku">SKU Code</MenuItem>
            <MenuItem value="price">Unit Price</MenuItem>
            <MenuItem value="stock_quantity">Stock Level</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Direction</InputLabel>
          <Select value={sortDir} label="Direction" onChange={handleSortDirChange}>
            <MenuItem value="desc">Descending</MenuItem>
            <MenuItem value="asc">Ascending</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Main Tabular Container */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product Details</TableCell>
              <TableCell>SKU Code</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell align="right">In Stock</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              // Skeleton Loading states
              Array(5).fill(0).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={16} />
                  </TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell align="right"><Skeleton variant="text" width={80} sx={{ ml: 'auto' }} /></TableCell>
                  <TableCell align="right"><Skeleton variant="text" width={60} sx={{ ml: 'auto' }} /></TableCell>
                  <TableCell align="center"><Skeleton variant="rectangular" width={80} height={32} sx={{ mx: 'auto', borderRadius: 1 }} /></TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="error" fontWeight="600">
                    Failed to load products: {error.message}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : productsList.length === 0 ? (
              // Empty State view
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Typography variant="h5" fontWeight="600" color="textSecondary" sx={{ mb: 1 }}>
                    No Products Found
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Try adjusting your search terms or add a new product to seed your catalog.
                  </Typography>
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/products/add')}>
                    Add First Product
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              // Active Product Rows mapping
              productsList.map((product) => {
                const isLowStock = product.stock_quantity < 10;
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="600" color="#0F172A">
                        {product.name}
                      </Typography>
                      {product.description && (
                        <Typography variant="caption" color="textSecondary" noWrap sx={{ display: 'block', maxWidth: 280 }}>
                          {product.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" fontWeight="600" bgcolor="#F1F5F9" px={1} py={0.5} borderRadius={1} display="inline-block">
                        {product.sku}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" style={{ fontWeight: 600 }}>
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight="700"
                        color={isLowStock ? 'error.main' : 'success.main'}
                      >
                        {product.stock_quantity}
                      </Typography>
                      {isLowStock && (
                        <Typography variant="caption" color="error" fontWeight="600" display="block">
                          Low Stock Warning
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => navigate(`/products/edit/${product.id}`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteClick(product.id, product.name)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination control footer bar */}
      {!isLoading && !error && productsList.length > 0 && (
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
          <WarningIcon color="error" /> Delete Product Catalog Item?
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <DialogContentText>
            Are you sure you want to delete the product catalog item <strong>"{deleteName}"</strong>? 
            This operation will permanently erase the product item. If this item has already been referenced by order records, the deletion will fail due to integrity controls.
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

export default ProductList;
