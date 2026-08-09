import React, { useState, useEffect } from 'react';
import type { Customer, CreateCustomerInput, CustomerType, CustomerStatus } from '../../types/customer.types';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { ErrorMessage } from '../common/ErrorMessage';
import { extractErrorMessage } from '../../services/api';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomerInput) => Promise<void>;
  initialData?: Customer | null;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('RETAIL');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<CustomerStatus>('LEAD');
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setMobile(initialData.mobile || '');
      setEmail(initialData.email || '');
      setBusinessName(initialData.business_name || '');
      setGstNumber(initialData.gst_number || '');
      setCustomerType(initialData.customer_type || 'RETAIL');
      setAddress(initialData.address || '');
      setStatus(initialData.status || 'LEAD');
      setFollowUpDate(
        initialData.follow_up_date
          ? new Date(initialData.follow_up_date).toISOString().split('T')[0]
          : ''
      );
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setMobile('');
      setEmail('');
      setBusinessName('');
      setGstNumber('');
      setCustomerType('RETAIL');
      setAddress('');
      setStatus('LEAD');
      setFollowUpDate('');
      setNotes('');
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !mobile || !email || !businessName || !address) {
      setError('Please fill in all required fields (Name, Mobile, Email, Business Name, Address)');
      return;
    }

    const payload: CreateCustomerInput = {
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      business_name: businessName.trim(),
      gst_number: gstNumber.trim() || null,
      customer_type: customerType,
      address: address.trim(),
      status,
      follow_up_date: followUpDate || null,
      notes: notes.trim() || null,
    };

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Customer' : 'Add New Customer'}
    >
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error || ''} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Input
            label="Customer Name *"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            required
          />

          <Input
            label="Mobile Number *"
            placeholder="+1 234 567 890"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Input
            label="Email Address *"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            required
          />

          <Input
            label="Business Name *"
            placeholder="Acme Corp"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Input
            label="GST Number"
            placeholder="22AAAAA0000A1Z5"
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value)}
            disabled={isSubmitting}
          />

          <Select
            label="Customer Type *"
            value={customerType}
            onChange={(e) => setCustomerType(e.target.value as CustomerType)}
            options={[
              { value: 'RETAIL', label: 'Retail' },
              { value: 'WHOLESALE', label: 'Wholesale' },
              { value: 'DISTRIBUTOR', label: 'Distributor' },
            ]}
            disabled={isSubmitting}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Select
            label="Status *"
            value={status}
            onChange={(e) => setStatus(e.target.value as CustomerStatus)}
            options={[
              { value: 'LEAD', label: 'Lead' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
            disabled={isSubmitting}
          />

          <Input
            label="Follow-up Date"
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address *</label>
          <textarea
            id="address"
            rows={2}
            placeholder="Street address, city, state..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            rows={2}
            placeholder="Additional details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData ? 'Save Changes' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
