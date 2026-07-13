import React, { useState } from 'react';
import { X } from 'lucide-react';
import {
  Autocomplete,
  TextField,
  Box,
  styled
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import './FilterPanel.css';
import Button from '../Button/Button';
import { useTranslation } from 'react-i18next';

// Extend dayjs to support custom formats like DD/MM/YYYY
dayjs.extend(customParseFormat);

export type FilterMode = 'transaction' | 'request' | 'customer' | 'feedback';

interface FilterPanelProps {
  onClose: () => void;
  onApply: (filters: FilterValues) => void;
  mode?: FilterMode;
}

export interface FilterValues {
  fromDate: string;
  toDate: string;
  projectService?: string;
  transactionType?: string;
  paymentMode?: string;
  // Request specific fields
  status?: string;
  contract?: string;
  preferredDate?: string;
  preferredTime?: string;
  // Customer specific fields
  customerType?: string;
  customerStatus?: string;
  // Feedback specific fields
  feedback?: string;
}

// Styled MUI components to match the project's theme
const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    height: '52px',
    borderRadius: '10px',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '16px',
    backgroundColor: '#FFF',
    '& fieldset': {
      borderColor: '#016937',
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: '#016937',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#016937',
    },
  },
  '& .MuiInputBase-input::placeholder': {
    color: '#000',
    opacity: 1,
  },
});

const StyledAutocomplete = styled(Autocomplete)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    padding: '0 12px', // Adjust padding for Autocomplete
    height: '52px',
    borderRadius: '10px',
    backgroundColor: '#FFF',
    border: 'none', // Remove native border to use fieldset border
    '& fieldset': {
      borderColor: '#016937',
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: '#016937',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#016937',
    },
  },
  '& .MuiAutocomplete-input': {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '16px',
    color: '#000',
  }
});

const FilterPanel: React.FC<FilterPanelProps> = ({ onClose, onApply, mode = 'transaction' }) => {
  const { t } = useTranslation(['transactions', 'invoice', 'common']);

  const [filters, setFilters] = useState<FilterValues>({
    fromDate: '',
    toDate: '',
    // Initialize common defaults with empty strings for "All"
    projectService: '',
    transactionType: '',
    paymentMode: '',
    status: '',
    contract: '',
    preferredDate: '',
    preferredTime: '',
    customerType: '',
    customerStatus: '',
    feedback: ''
  });

  const handleInputChange = (field: keyof FilterValues, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (field: 'fromDate' | 'toDate' | 'preferredDate', date: Dayjs | null) => {
    if (date) {
      handleInputChange(field, date.format('DD/MM/YYYY'));
    } else {
      handleInputChange(field, '');
    }
  };

  const handleTimeChange = (time: Dayjs | null) => {
    if (time) {
      handleInputChange('preferredTime', time.format('HH:mm'));
    } else {
      handleInputChange('preferredTime', '');
    }
  };


  const handleClear = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      projectService: '',
      transactionType: '',
      paymentMode: '',
      status: '',
      contract: '',
      preferredDate: '',
      preferredTime: '',
      customerType: '',
      customerStatus: '',
      feedback: ''
    });
  };

  const handleApply = () => {
    // Clean up filters based on mode if needed, or just send everything
    onApply(filters);
  };

  // Options as objects for stability and localization
  const projectOptions = [
    { label: t('transactions:filters.allProject'), value: '' },
    { label: t('transactions:filters.wasteCollection'), value: 'Waste Collection' },
    { label: t('transactions:filters.wasteDisposal'), value: 'Waste Disposal' },
    { label: t('transactions:filters.constructionWaste'), value: 'Construction Waste Removal' }
  ];
  const typeOptions = [
    { label: t('transactions:filters.all'), value: '' },
    { label: t('transactions:filters.topUp'), value: 'Top-up' },
    { label: t('transactions:filters.payment'), value: 'Payment' },
    { label: t('transactions:filters.refund'), value: 'Refund' }
  ];
  const modeOptions = [
    { label: t('transactions:filters.allMode'), value: '' },
    { label: t('transactions:filters.wallet'), value: 'Wallet' },
    { label: t('transactions:filters.card'), value: 'Card' },
    { label: t('transactions:filters.bankTransfer'), value: 'Bank Transfer' }
  ];

  const statusOptions = [
    { label: t('transactions:filters.all'), value: '' },
    { label: t('transactions:filters.paid'), value: 'paid' },
    { label: t('transactions:filters.pending'), value: 'pending' },
    { label: t('transactions:filters.inProgress'), value: 'in-progress' },
    { label: t('transactions:filters.scheduled'), value: 'scheduled' },
    { label: t('transactions:filters.completed'), value: 'completed' }
  ];
  const contractOptions = [
    { label: t('transactions:filters.allContracts'), value: '' },
    { label: "Contract 1", value: "contract-1" },
    { label: "Contract 2", value: "contract-2" },
    { label: "Contract 3", value: "contract-3" }
  ];

  const customerTypeOptions = [
    { label: t('transactions:filters.all'), value: '' },
    { label: 'Postpaid', value: 'Postpaid' },
    { label: 'Prepaid', value: 'Prepaid' }
  ];

  const customerStatusOptions = [
    { label: t('transactions:filters.all'), value: '' },
    { label: 'Active', value: 'Active' },
    { label: 'Hold', value: 'Hold' }
  ];

  const feedbackStatusOptions = [
    { label: t('transactions:filters.all'), value: '' },
    { label: 'Excellent', value: 'Excellent' },
    { label: 'Very Good', value: 'Very Good' },
    { label: 'Good', value: 'Good' },
    { label: 'Poor', value: 'Poor' }
  ];

  return (
    <Box className="filter-panel">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="filter-panel-header">
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="filter-panel-title">
          <h3>{t('transactions:filters.title')}</h3>
          <button className="clear-all-button" onClick={handleClear}>
            {t('common:buttons.clear')}
          </button>
        </div>

        <div className="filter-panel-content">
          <div className="filter-group">
            <label>{t('transactions:filters.fromDate')}</label>
            <DatePicker
              value={filters.fromDate ? dayjs(filters.fromDate, 'DD/MM/YYYY') : null}
              onChange={(date) => handleDateChange('fromDate', date)}
              format="DD/MM/YYYY"
              enableAccessibleFieldDOMStructure={false}
              slots={{
                textField: (params) => (
                  <StyledTextField
                    {...params}
                    fullWidth
                    placeholder="DD/MM/YYYY"
                  />
                ),
              }}
            />
          </div>

          <div className="filter-group">
            <label>{t('transactions:filters.toDate')}</label>
            <DatePicker
              value={filters.toDate ? dayjs(filters.toDate, 'DD/MM/YYYY') : null}
              onChange={(date) => handleDateChange('toDate', date)}
              format="DD/MM/YYYY"
              enableAccessibleFieldDOMStructure={false}
              slots={{
                textField: (params) => (
                  <StyledTextField
                    {...params}
                    fullWidth
                    placeholder="DD/MM/YYYY"
                  />
                ),
              }}
            />
          </div>

          {mode === 'transaction' && (
            <>
              <div className="filter-group">
                <label>{t('transactions:filters.projectService')}</label>
                <StyledAutocomplete
                  options={projectOptions}
                  getOptionLabel={(option: any) => option.label || ''}
                  isOptionEqualToValue={(option: any, value: any) => {
                    if (typeof value === 'string') return option.value === value;
                    return option.value === value.value;
                  }}
                  value={projectOptions.find(opt => opt.value === filters.projectService) || null}
                  onChange={(_, newValue: any) => handleInputChange('projectService', newValue?.value ?? '')}
                  renderInput={(params) => (
                    <StyledTextField {...params} placeholder={t('transactions:filters.projectService')} />
                  )}
                  disablePortal
                />
              </div>

              <div className="filter-group">
                <label>{t('transactions:filters.transactionType')}</label>
                <StyledAutocomplete
                  options={typeOptions}
                  getOptionLabel={(option: any) => option.label || ''}
                  isOptionEqualToValue={(option: any, value: any) => {
                    if (typeof value === 'string') return option.value === value;
                    return option.value === value.value;
                  }}
                  value={typeOptions.find(opt => opt.value === filters.transactionType) || null}
                  onChange={(_, newValue: any) => handleInputChange('transactionType', newValue?.value ?? '')}
                  renderInput={(params) => (
                    <StyledTextField {...params} placeholder={t('transactions:filters.transactionType')} />
                  )}
                  disablePortal
                />
              </div>

              <div className="filter-group">
                <label>{t('transactions:filters.paymentMode')}</label>
                <StyledAutocomplete
                  options={modeOptions}
                  getOptionLabel={(option: any) => option.label || ''}
                  isOptionEqualToValue={(option: any, value: any) => {
                    if (typeof value === 'string') return option.value === value;
                    return option.value === value.value;
                  }}
                  value={modeOptions.find(opt => opt.value === filters.paymentMode) || null}
                  onChange={(_, newValue: any) => handleInputChange('paymentMode', newValue?.value ?? '')}
                  renderInput={(params) => (
                    <StyledTextField {...params} placeholder={t('transactions:filters.paymentMode')} />
                  )}
                  disablePortal
                />
              </div>
            </>
          )}

          {mode === 'request' && (
            <>
              <div className="filter-group">
                <label>{t('invoice:filters.status')}</label>
                <StyledAutocomplete
                  options={statusOptions}
                  getOptionLabel={(option: any) => option.label || ''}
                  isOptionEqualToValue={(option: any, value: any) => {
                    if (typeof value === 'string') return option.value === value;
                    return option.value === value.value;
                  }}
                  value={statusOptions.find(opt => opt.value === filters.status) || null}
                  onChange={(_, newValue: any) => handleInputChange('status', newValue?.value ?? '')}
                  renderInput={(params) => (
                    <StyledTextField {...params} placeholder={t('invoice:filters.status')} />
                  )}
                  disablePortal
                />
              </div>

              <div className="filter-group">
                <label>{t('transactions:filters.contract')}</label>
                <StyledAutocomplete
                  options={contractOptions}
                  getOptionLabel={(option: any) => option.label || ''}
                  isOptionEqualToValue={(option: any, value: any) => {
                    if (typeof value === 'string') return option.value === value;
                    return option.value === value.value;
                  }}
                  value={contractOptions.find(opt => opt.value === filters.contract) || null}
                  onChange={(_, newValue: any) => handleInputChange('contract', newValue?.value ?? '')}
                  renderInput={(params) => (
                    <StyledTextField {...params} placeholder={t('transactions:filters.contract')} />
                  )}
                  disablePortal
                />
              </div>

              <div className="filter-group">
                <label>{t('transactions:filters.preferredDate')}</label>
                <DatePicker
                  value={filters.preferredDate ? dayjs(filters.preferredDate, 'DD/MM/YYYY') : null}
                  onChange={(date) => handleDateChange('preferredDate', date)}
                  format="DD/MM/YYYY"
                  enableAccessibleFieldDOMStructure={false}
                  slots={{
                    textField: (params) => (
                      <StyledTextField
                        {...params}
                        fullWidth
                        placeholder="DD/MM/YYYY"
                      />
                    ),
                  }}
                />
              </div>

              <div className="filter-group">
                <label>{t('transactions:filters.preferredTime')}</label>
                <TimePicker
                  value={filters.preferredTime ? dayjs(filters.preferredTime, 'HH:mm') : null}
                  onChange={(time) => handleTimeChange(time)}
                  enableAccessibleFieldDOMStructure={false}
                  slots={{
                    textField: (params) => (
                      <StyledTextField
                        {...params}
                        fullWidth
                        placeholder="HH:mm"
                      />
                    )
                  }}
                />
              </div>
            </>
          )}

          {mode === 'customer' && (
            <>
              <div className="filter-group">
                <label>Customer Type</label>
                <StyledAutocomplete
                  options={customerTypeOptions}
                  getOptionLabel={(option: any) => option.label || ''}
                  isOptionEqualToValue={(option: any, value: any) => {
                    if (typeof value === 'string') return option.value === value;
                    return option.value === value.value;
                  }}
                  value={customerTypeOptions.find(opt => opt.value === filters.customerType) || null}
                  onChange={(_, newValue: any) => handleInputChange('customerType', newValue?.value ?? '')}
                  renderInput={(params) => (
                    <StyledTextField {...params} placeholder="Select" />
                  )}
                  disablePortal
                />
              </div>

              <div className="filter-group">
                <label>Status</label>
                <StyledAutocomplete
                  options={customerStatusOptions}
                  getOptionLabel={(option: any) => option.label || ''}
                  isOptionEqualToValue={(option: any, value: any) => {
                    if (typeof value === 'string') return option.value === value;
                    return option.value === value.value;
                  }}
                  value={customerStatusOptions.find(opt => opt.value === filters.customerStatus) || null}
                  onChange={(_, newValue: any) => handleInputChange('customerStatus', newValue?.value ?? '')}
                  renderInput={(params) => (
                    <StyledTextField {...params} placeholder="Select" />
                  )}
                  disablePortal
                />
              </div>
            </>
          )}

          {mode === 'feedback' && (
            <>
              <div className="filter-group">
                <label>Customer Type</label>
                <StyledAutocomplete
                  options={customerTypeOptions}
                  getOptionLabel={(option: any) => option.label || ''}
                  isOptionEqualToValue={(option: any, value: any) => {
                    if (typeof value === 'string') return option.value === value;
                    return option.value === value.value;
                  }}
                  value={customerTypeOptions.find(opt => opt.value === filters.customerType) || null}
                  onChange={(_, newValue: any) => handleInputChange('customerType', newValue?.value ?? '')}
                  renderInput={(params) => (
                    <StyledTextField {...params} placeholder="Select" />
                  )}
                  disablePortal
                />
              </div>

              <div className="filter-group">
                <label>Feedback Rating</label>
                <StyledAutocomplete
                  options={feedbackStatusOptions}
                  getOptionLabel={(option: any) => option.label || ''}
                  isOptionEqualToValue={(option: any, value: any) => {
                    if (typeof value === 'string') return option.value === value;
                    return option.value === value.value;
                  }}
                  value={feedbackStatusOptions.find(opt => opt.value === filters.feedback) || null}
                  onChange={(_, newValue: any) => handleInputChange('feedback', newValue?.value ?? '')}
                  renderInput={(params) => (
                    <StyledTextField {...params} placeholder="Select" />
                  )}
                  disablePortal
                />
              </div>
            </>
          )}
        </div>

        <div className="filter-panel-actions">
          <Button variant="outline-primary" className="clear-button" onClick={handleClear}>{t('common:buttons.clear')}</Button>
          <Button variant="primary" className="apply-button" onClick={handleApply}>{t('common:buttons.apply')}</Button>
        </div>
      </LocalizationProvider>
    </Box >
  );
};

export default FilterPanel;
