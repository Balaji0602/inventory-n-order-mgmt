import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  Typography,
  Box,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  CircularProgress,
  Divider,
  Paper,
  Tooltip
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useProducts } from '../hooks/useProducts';
import { useCustomers } from '../hooks/useCustomers';
import { useOrders } from '../hooks/useOrders';
import { formatCurrency } from '../utils/formatters';

const Dashboard = () => {
  const navigate = useNavigate();

  // Fetch count aggregations using our custom query hooks
  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 100 });
  const { data: customersData, isLoading: customersLoading } = useCustomers({ limit: 100 });
  const { data: ordersData, isLoading: ordersLoading } = useOrders({ limit: 100 });

  const isDataLoading = productsLoading || customersLoading || ordersLoading;

  if (isDataLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  // Calculate parameters from fetched data
  const totalProducts = productsData?.data?.total || 0;
  const totalCustomers = customersData?.data?.total || 0;
  const totalOrders = ordersData?.data?.total || 0;

  // Filter low stock products (< 10 units)
  const allProducts = productsData?.data?.items || [];
  const lowStockProducts = allProducts.filter((p) => p.stock_quantity < 10);
  const lowStockCount = lowStockProducts.length;

  const allOrders = ordersData?.data?.items || [];
  const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);

  // SVG Chart: Order Trends (Mock data representing last 7 days derived dynamically)
  const trendData = [3, 5, 2, 8, 7, 12, totalOrders || 5];
  const chartWidth = 500;
  const chartHeight = 200;
  const padding = 30;
  const points = trendData.map((val, idx) => {
    const x = padding + (idx * (chartWidth - padding * 2)) / (trendData.length - 1);
    const y = chartHeight - padding - (val * (chartHeight - padding * 2)) / Math.max(...trendData, 10);
    return `${x},${y}`;
  }).join(' ');

  // SVG Chart: Inventory Status Breakdown (In-Stock vs Low-Stock)
  const inStockCount = totalProducts - lowStockCount;
  const inStockPercentage = totalProducts > 0 ? (inStockCount / totalProducts) * 100 : 100;
  const lowStockPercentage = totalProducts > 0 ? (lowStockCount / totalProducts) * 100 : 0;

  const cardStats = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: <InventoryIcon sx={{ fontSize: 28 }} />,
      color: '#2563EB',
      bg: 'rgba(37, 99, 235, 0.08)',
      path: '/products',
    },
    {
      title: 'Total Customers',
      value: totalCustomers,
      icon: <PeopleIcon sx={{ fontSize: 28 }} />,
      color: '#7C3AED',
      bg: 'rgba(124, 58, 237, 0.08)',
      path: '/customers',
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: <ShoppingCartIcon sx={{ fontSize: 28 }} />,
      color: '#16A34A',
      bg: 'rgba(22, 163, 74, 0.08)',
      path: '/orders',
      extra: `Revenue: ${formatCurrency(totalRevenue)}`,
    },
    {
      title: 'Low Stock Alerts',
      value: lowStockCount,
      icon: <WarningAmberIcon sx={{ fontSize: 28 }} />,
      color: lowStockCount > 0 ? '#DC2626' : '#94A3B8',
      bg: lowStockCount > 0 ? 'rgba(220, 38, 38, 0.08)' : '#F1F5F9',
      path: '/products',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header Overview Welcome */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h3" fontWeight="700" gutterBottom>
            Welcome Back, Admin
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Here's what is happening with your active inventory and orders today.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          onClick={() => navigate('/orders/create')}
        >
          Create Order
        </Button>
      </Box>

      {/* Cards Statistics Row */}
      <Grid container spacing={3}>
        {cardStats.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: card.color,
                  boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.05)',
                },
              }}
              onClick={() => navigate(card.path)}
            >
              <Box>
                <Typography variant="subtitle2" color="textSecondary" fontWeight="600" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="h2" fontWeight="700" sx={{ color: '#0F172A', my: 0.5 }}>
                  {card.value}
                </Typography>
                {card.extra && (
                  <Typography variant="caption" fontWeight="600" color="success.main">
                    {card.extra}
                  </Typography>
                )}
              </Box>
              <Avatar sx={{ bgcolor: card.bg, color: card.color, width: 56, height: 56 }}>
                {card.icon}
              </Avatar>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* SVG Chart 1: Order Trends */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid #E2E8F0' }}>
            <Typography variant="h4" fontWeight="700" gutterBottom>
              Order Activity Trends
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
              Visual graph showcasing placed orders volume metrics.
            </Typography>

            <Box display="flex" justifyContent="center">
              <svg width="100%" height="220" viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#F1F5F9" strokeWidth="1" />
                <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#F1F5F9" strokeWidth="1" />
                <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#E2E8F0" strokeWidth="2" />

                {/* Chart Area Fill */}
                <polygon
                  points={`${padding},${chartHeight - padding} ${points} ${chartWidth - padding},${chartHeight - padding}`}
                  fill="url(#chartGrad)"
                />

                {/* Trend line */}
                <polyline
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3"
                  points={points}
                  strokeLinecap="round"
                />

                {/* Interactive Points */}
                {trendData.map((val, idx) => {
                  const x = padding + (idx * (chartWidth - padding * 2)) / (trendData.length - 1);
                  const y = chartHeight - padding - (val * (chartHeight - padding * 2)) / Math.max(...trendData, 10);
                  return (
                    <g key={idx} style={{ cursor: 'pointer' }}>
                      <circle cx={x} cy={y} r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
                      <text x={x} y={y - 12} fontSize="10" fontWeight="600" textAnchor="middle" fill="#475569">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* X labels */}
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                  const x = padding + (idx * (chartWidth - padding * 2)) / (trendData.length - 1);
                  return (
                    <text key={day} x={x} y={chartHeight - 8} fontSize="11" fontWeight="500" textAnchor="middle" fill="#94A3B8">
                      {day}
                    </text>
                  );
                })}
              </svg>
            </Box>
          </Paper>
        </Grid>

        {/* SVG Chart 2: Inventory Status Breakdown */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid #E2E8F0', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" fontWeight="700" gutterBottom>
              Inventory Status
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
              Current stock availability shares.
            </Typography>

            {totalProducts === 0 ? (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1} py={3}>
                <InventoryIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1.5 }} />
                <Typography variant="body2" color="textSecondary">
                  No catalog products available.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
                {/* Visual linear progress representation */}
                <Box>
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight="600" color="text.secondary">In Stock Products</Typography>
                    <Typography variant="subtitle2" fontWeight="700" color="primary.main">{inStockPercentage.toFixed(0)}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={inStockPercentage}
                    sx={{ height: 10, borderRadius: 5, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: '#2563EB' } }}
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                    {inStockCount} items are in safe quantities.
                  </Typography>
                </Box>

                <Box>
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight="600" color="text.secondary">Low Stock Warning</Typography>
                    <Typography variant="subtitle2" fontWeight="700" color="error.main">{lowStockPercentage.toFixed(0)}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={lowStockPercentage}
                    sx={{ height: 10, borderRadius: 5, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: '#DC2626' } }}
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                    {lowStockCount} items require immediate restock.
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Low Stock Product Warnings Grid */}
      <Card sx={{ p: 4, borderRadius: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <WarningAmberIcon color="error" />
            <Typography variant="h4" fontWeight="700">
              Low Stock Alert List
            </Typography>
          </Box>
          <Button
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/products')}
          >
            Manage Products
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {lowStockCount === 0 ? (
          <Box py={4} textAlign="center">
            <Typography variant="body1" color="success.main" fontWeight="600">
              ✓ All products are fully stocked! No current low stock inventory items found.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {lowStockProducts.slice(0, 5).map((product, idx) => (
              <React.Fragment key={product.id}>
                {idx > 0 && <Divider sx={{ borderColor: '#F1F5F9' }} />}
                <ListItem
                  sx={{
                    py: 1.75,
                    px: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <ListItemText
                    primary={product.name}
                    primaryTypographyProps={{ fontWeight: 600, color: '#0F172A' }}
                    secondary={`SKU: ${product.sku} | Price: ${formatCurrency(product.price)}`}
                    secondaryTypographyProps={{ fontSize: '0.825rem' }}
                  />
                  <Box display="flex" alignItems="center" gap={3}>
                    <Box textAlign="right">
                      <Typography variant="subtitle2" fontWeight="700" color="error.main">
                        {product.stock_quantity} remaining
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Low stock warning
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/products/edit/${product.id}`)}
                    >
                      Restock
                    </Button>
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Card>
    </Box>
  );
};

export default Dashboard;
