// import { useState } from 'react';
// import { useApi } from '../../hooks/useApi';
// import { storageApi } from '../../api/warehouse';
// import { useTheme } from '../../contexts/ThemeContext';
// import { getThemeStyles } from '../../utils/themeStyles';
// import PageHeader from '../../components/PageHeader';
// import StatCard from '../../components/StatCard';
// import Button from '../../components/Button';
// import Input from '../../components/Input';
// import Form from '../../components/Form';
// import FormRow from '../../components/FormRow';
// import FormActions from '../../components/FormActions';
// import ItemDetailCard from '../../components/ItemDetailCard';
// import ItemDetailField from '../../components/ItemDetailField';
// import Loading from '../../components/Loading';
// import Error from '../../components/Error';

// const StoragePage = () => {
//   const theme = useTheme();
//   const styles = getThemeStyles(theme);
//   const { data: locations, loading, error, refetch } = useApi(() => storageApi.getAll());
//   const [isCreating, setIsCreating] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     address: '',
//     capacity: '',
//     type: 'Warehouse',
//   });
//   const [submitting, setSubmitting] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleCreate = () => {
//     setIsCreating(true);
//     setFormData({ name: '', address: '', capacity: '', type: 'Warehouse' });
//   };

//   const handleEdit = (location) => {
//     setEditingId(location.id);
//     setFormData({
//       name: location.name,
//       address: location.address,
//       capacity: location.capacity.toString(),
//       type: location.type,
//     });
//     setIsCreating(false);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this storage location?')) {
//       try {
//         setSubmitting(true);
//         await storageApi.delete(id);
//         refetch();
//       } catch (err) {
//         alert('Failed to delete storage location: ' + err.message);
//       } finally {
//         setSubmitting(false);
//       }
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       setSubmitting(true);
//       const locationData = {
//         ...formData,
//         capacity: parseInt(formData.capacity),
//       };
//       if (isCreating) {
//         await storageApi.create(locationData);
//       } else {
//         await storageApi.update(editingId, locationData);
//       }
//       setIsCreating(false);
//       setEditingId(null);
//       setFormData({ name: '', address: '', capacity: '', type: 'Warehouse' });
//       refetch();
//     } catch (err) {
//       alert('Failed to save storage location: ' + err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleCancel = () => {
//     setIsCreating(false);
//     setEditingId(null);
//     setFormData({ name: '', address: '', capacity: '', type: 'Warehouse' });
//   };

//   const getUsagePercentage = (used, capacity) => {
//     if (!capacity || capacity === 0) return 0;
//     return Math.round((used / capacity) * 100);
//   };

//   const getUsageColor = (percentage) => {
//     if (percentage >= 90) return 'var(--secondary-100)';
//     if (percentage >= 70) return 'var(--main-100)';
//     return 'var(--gray-50)';
//   };

//   if (loading) {
//     return <Loading message="Loading storage locations..." />;
//   }

//   if (error) {
//     return <Error message={error} onRetry={refetch} />;
//   }

//   const locationsList = locations || [];
//   const totalCapacity = locationsList.reduce((sum, loc) => sum + (loc.capacity || 0), 0);
//   const totalUsed = locationsList.reduce((sum, loc) => sum + (loc.used || 0), 0);
//   const overallUsage = totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0;

//   const stats = [
//     { value: locationsList.length, label: 'Total Locations' },
//     { value: totalCapacity, label: 'Total Capacity' },
//     { value: totalUsed, label: 'Total Used' },
//     { value: `${overallUsage}%`, label: 'Overall Usage' },
//   ];

//   return (
//     <div className={styles.pageContent}>
//       <PageHeader title="Storage Management" subtitle="Manage Storage Locations" />

//       <div className={styles.statsGrid}>
//         {stats.map((stat, index) => (
//           <StatCard key={index} value={stat.value} label={stat.label} />
//         ))}
//       </div>

//       <div className={styles.pageActions}>
//         <Button variant="primary" onClick={handleCreate} disabled={submitting}>
//           + Add New Location
//         </Button>
//       </div>

//       {(isCreating || editingId) && (
//         <ItemDetailCard
//           title={isCreating ? 'Create New Storage Location' : 'Edit Storage Location'}
//           fullWidth
//         >
//           <Form onSubmit={handleSubmit}>
//             <FormRow>
//               <Input
//                 label="Location Name"
//                 name="name"
//                 type="text"
//                 value={formData.name}
//                 onChange={handleChange}
//                 required
//                 disabled={submitting}
//               />
//               <Input
//                 label="Type"
//                 name="type"
//                 type="select"
//                 value={formData.type}
//                 onChange={handleChange}
//                 required
//                 disabled={submitting}
//               >
//                 <option value="Warehouse">Warehouse</option>
//                 <option value="Retail">Retail</option>
//                 <option value="Specialized">Specialized</option>
//               </Input>
//             </FormRow>
//             <Input
//               label="Address"
//               name="address"
//               type="text"
//               value={formData.address}
//               onChange={handleChange}
//               required
//               disabled={submitting}
//             />
//             <Input
//               label="Capacity (units)"
//               name="capacity"
//               type="number"
//               value={formData.capacity}
//               onChange={handleChange}
//               min="1"
//               required
//               disabled={submitting}
//             />
//             <FormActions>
//               <Button type="submit" variant="primary" disabled={submitting}>
//                 {isCreating ? 'Create Location' : 'Save Changes'}
//               </Button>
//               <Button type="button" onClick={handleCancel} disabled={submitting}>
//                 Cancel
//               </Button>
//             </FormActions>
//           </Form>
//         </ItemDetailCard>
//       )}

//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
//         {locationsList.map((location) => {
//           const usagePercentage = getUsagePercentage(location.used, location.capacity);
//           return (
//             <ItemDetailCard key={location.id} title={location.name}>
//               <ItemDetailField label="Type" value={location.type || 'N/A'} />
//               <ItemDetailField label="Address" value={location.address || 'N/A'} />
//               <ItemDetailField label="Capacity" value={`${location.capacity || 0} units`} />
//               <ItemDetailField label="Used" value={`${location.used || 0} units`} />
//               <div style={{ marginBottom: '24px' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
//                   <span className={styles.itemDetailLabel}>Usage</span>
//                   <span style={{ fontWeight: 700, color: getUsageColor(usagePercentage) }}>
//                     {usagePercentage}%
//                   </span>
//                 </div>
//                 <div
//                   style={{
//                     width: '100%',
//                     height: '24px',
//                     border: 'var(--border-width) solid var(--gray-100)',
//                     backgroundColor: 'var(--gray-30)',
//                     position: 'relative',
//                     overflow: 'hidden',
//                   }}
//                 >
//                   <div
//                     style={{
//                       width: `${usagePercentage}%`,
//                       height: '100%',
//                       backgroundColor: getUsageColor(usagePercentage),
//                       transition: 'width 0.3s ease',
//                     }}
//                   />
//                 </div>
//               </div>
//               <div style={{ display: 'flex', gap: '8px' }}>
//                 <Button
//                   onClick={() => handleEdit(location)}
//                   style={{ flex: 1, padding: '8px 16px', fontSize: '12px' }}
//                   disabled={submitting}
//                 >
//                   Edit
//                 </Button>
//                 <Button
//                   variant="secondary"
//                   onClick={() => handleDelete(location.id)}
//                   style={{ flex: 1, padding: '8px 16px', fontSize: '12px' }}
//                   disabled={submitting}
//                 >
//                   Delete
//                 </Button>
//               </div>
//             </ItemDetailCard>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default StoragePage;
