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
import useExclusivePicker from '../../hooks/useExclusivePicker';

// Extend dayjs to support custom formats like DD/MM/YYYY
dayjs.extend(customParseFormat);

export type FilterMode = 'transaction' | 'request' | 'customer' | 'feedback' | 'enquiry';

export interface FilterOption {
  label: string;
  value: string;
}

/**
 * A caller-defined filter dropdown. Use these via the `fields` prop when a module's
 * filters should be driven by its own table columns rather than by one of the
 * hardcoded `mode` layouts below.
 */
export interface FilterFieldConfig {
  /** Key written into the applied FilterValues, e.g. 'status'. */
  key: string;
  label: string;
  /** Column values to offer. Include an "All" entry with value '' if you want one. */
  options: FilterOption[];
  placeholder?: string;
}

interface FilterPanelProps {
  onClose: () => void;
  onApply: (filters: FilterValues) => void;
  mode?: FilterMode;
  /**
   * Caller-defined dropdowns, rendered under the From/To date range instead of a
   * `mode` layout. Prefer this for new modules: `mode` hardcodes each module's
   * options inside this package, which does not scale and cannot reflect live data.
   * When `fields` is set, `mode` is ignored.
   */
  fields?: FilterFieldConfig[];
  /**
   * Supervisor choices for `mode="enquiry"`. Sourced from the Employee Master by
   * the caller, since this package has no data layer. An "Unassigned" entry is
   * prepended automatically.
   */
  supervisorOptions?: FilterOption[];
  /** Seeds the form so a reopened panel shows the filters already in effect. */
  initialValues?: Partial<FilterValues>;
  /** Overrides the From/To date labels, e.g. "Start Date From". */
  dateLabels?: { from?: string; to?: string };
  /**
   * KP1-I78: the From/To range filters records that ALREADY EXIST, so by default
   * nothing after today can be picked — a future range can only ever return an empty
   * table.
   *
   * Opt out when the range targets a date that legitimately looks forward. Today that
   * is exactly one caller: the admin Contract list filters on `startDate`, and a
   * contract can be created now to start next month.
   */
  allowFutureDates?: boolean;
}

export interface FilterValues {
  /** Keys supplied via `fields` land here alongside the built-in ones. */
  [key: string]: string | undefined;
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
  // Enquiry specific fields
  supervisor?: string;
  enquiryType?: string;
}

// Styled MUI components to match the project's theme.
// KP1-I75: 52px/16px fields made the panel taller than the viewport; 44px/14px keeps
// them readable while the whole set fits without stretching.
const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    height: '44px',
    borderRadius: '10px',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '14px',
    backgroundColor: '#FFF',
    '& fieldset': {
      borderColor: 'hsl(var(--primary))',
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: 'hsl(var(--primary))',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'hsl(var(--primary))',
    },
  },
  '& .MuiInputBase-input::placeholder': {
    color: '#000',
    opacity: 1,
  },
});

const AutocompleteBase = styled(Autocomplete)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    padding: '0 12px', // Adjust padding for Autocomplete
    height: '44px',
    borderRadius: '10px',
    backgroundColor: '#FFF',
    border: 'none', // Remove native border to use fieldset border
    '& fieldset': {
      borderColor: 'hsl(var(--primary))',
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: 'hsl(var(--primary))',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'hsl(var(--primary))',
    },
  },
  '& .MuiAutocomplete-input': {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '14px',
    color: '#000',
  }
});

/**
 * KP1-I57: an Autocomplete's option list is portaled to <body> and positioned against
 * the viewport, so nothing about this panel's own layout stopped it from opening
 * straight over the Clear/Apply bar that KP1-I75 pinned to the bottom.
 *
 * Two constraints make that impossible, and they belong on the base component rather
 * than on each call site so any dropdown added here later inherits them:
 *  - `preventOverflow` on the alt (vertical) axis, whose default boundary is the
 *    reference's clipping parents — i.e. `.filter-panel-content`, the scrolling field
 *    area whose bottom edge is exactly where the action bar starts. The list is kept
 *    inside it instead of running past it.
 *  - a height cap, so a long list still fits ABOVE the field when `flip` sends it
 *    there rather than being clamped on top of its own input.
 */
const OPTION_LIST_MAX_HEIGHT = 176; // ~4.5 rows; short enough to fit either side of a field

/**
 * A component, not a string: `StyledAutocomplete` is defined at module scope where
 * `useTranslation` cannot be called, and the panel's own `t` is scoped inside the
 * FilterPanel function below (KP1-I91).
 */
const NoMatchesText: React.FC = () => {
  const { t } = useTranslation(['common']);
  return <>{t('common:emptyStates.noMatches', 'No matches found')}</>;
};

const StyledAutocomplete: React.FC<any> = (props) => (
  <AutocompleteBase
    /**
     * KP1-I91: "No matches found" rather than MUI's bare "No options", for every dropdown
     * in this panel at once — the ticket asks for it on any field searched with data that
     * matches nothing, not just the Enquiry form's Area Name.
     *
     * Set here on the base rather than per call site so a filter added later inherits it,
     * and overridable by a caller that passes its own. The default sits in the shared
     * `common` namespace; the literal is i18next's defaultValue so a missing key can never
     * render as raw text (KP1-I56).
     */
    noOptionsText={props.noOptionsText ?? <NoMatchesText />}
    slotProps={{
      listbox: { sx: { maxHeight: `${OPTION_LIST_MAX_HEIGHT}px` } },
      popper: {
        modifiers: [
          { name: 'flip', enabled: true, options: { padding: 8 } },
          { name: 'preventOverflow', enabled: true, options: { padding: 8, altAxis: true } },
        ],
      },
    }}
    {...props}
  />
);

/** Every field empty — an empty string means "All" for a given filter. */
const EMPTY_FILTERS: FilterValues = {
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
  feedback: '',
  supervisor: '',
  enquiryType: ''
};

const FilterPanel: React.FC<FilterPanelProps> = ({
  onClose,
  onApply,
  mode = 'transaction',
  fields,
  supervisorOptions = [],
  initialValues,
  dateLabels,
  allowFutureDates = false
}) => {
  const { t } = useTranslation(['transactions', 'invoice', 'common', 'adminEnquiries']);

  const [filters, setFilters] = useState<FilterValues>({ ...EMPTY_FILTERS, ...initialValues });

  /**
   * KP1-I77: the panel's pickers are the pair a tester is most likely to have open at
   * once — From and To sit one above the other. Each drives MUI's controlled `open`
   * through the shared registry, so opening one closes the other (and any picker
   * elsewhere on the page) without depending on a click reaching `document`.
   *
   * The `request` mode's Preferred Date/Time pickers join the same slot; the hooks are
   * called unconditionally because that mode is chosen at render time.
   */
  const fromPicker = useExclusivePicker();
  const toPicker = useExclusivePicker();
  const preferredDatePicker = useExclusivePicker();
  const preferredTimePicker = useExclusivePicker();

  /**
   * Reopening the panel must show the filters currently in effect — including any the
   * caller changed elsewhere (e.g. list tabs that write the same keys), which is why
   * this re-seeds rather than relying on the initial useState value.
   */
  React.useEffect(() => {
    setFilters({ ...EMPTY_FILTERS, ...initialValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialValues)]);

  /** `fields` replaces the hardcoded `mode` layouts entirely. */
  const useCustomFields = Array.isArray(fields) && fields.length > 0;

  /**
   * KP1-I56: a `fields` dropdown fell back to `field.label` for its placeholder, so
   * every one of them printed its own label twice — "Customer Type" above the box and
   * "Customer Type" inside it. The `mode` layouts below already say "Select"; this is
   * the same default for the path that replaced them.
   *
   * The literal is passed as i18next's defaultValue rather than relying on the key
   * existing: a missing key in this package fails silently as visible raw text, and a
   * placeholder reading `common:placeholders.select` would be worse than the bug.
   */
  const selectPlaceholder = t('common:placeholders.select', 'Select');

  const handleClearCustom = () => {
    // Keep the caller's keys present but empty, so "All" resolves rather than undefined.
    const cleared: FilterValues = { ...EMPTY_FILTERS };
    (fields ?? []).forEach((field) => { cleared[field.key] = ''; });
    setFilters(cleared);
  };

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
    if (useCustomFields) {
      handleClearCustom();
      return;
    }
    setFilters(EMPTY_FILTERS);
  };

  const handleApply = () => {
    // Clean up filters based on mode if needed, or just send everything
    onApply(filters);
  };

  /**
   * The range ends as dayjs, parsed with the panel's own DD/MM/YYYY dialect (the APIs
   * use YYYY-MM-DD; conversion happens at the caller's boundary). One source for both
   * the To picker's value and the bounds each picker puts on the other (KP1-I65).
   */
  const fromDateValue = filters.fromDate ? dayjs(filters.fromDate, 'DD/MM/YYYY') : null;
  const toDateValue = filters.toDate ? dayjs(filters.toDate, 'DD/MM/YYYY') : null;

  /**
   * KP1-I78: the range filters records that already exist, so both ends stop at today
   * unless the caller opted out (`allowFutureDates`). Computed per render rather than
   * memoised, so a panel left open across midnight still bounds correctly.
   *
   * This stacks with KP1-I65's cross-bounds instead of replacing them: `From` is capped
   * by whichever comes FIRST — a chosen `To`, or today.
   */
  const latestSelectable = allowFutureDates ? null : dayjs().endOf('day');
  const earlier = (a: Dayjs | null, b: Dayjs | null) =>
    a && b ? (a.isBefore(b) ? a : b) : (a ?? b);

  const fromMaxDate = earlier(toDateValue, latestSelectable);

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

  const enquiryStatusOptions = [
    { label: t('adminEnquiries:list.filters.allStatuses'), value: '' },
    { label: t('adminEnquiries:status.active'), value: 'active' },
    { label: t('adminEnquiries:status.secured'), value: 'secured' },
    { label: t('adminEnquiries:status.lost'), value: 'lost' }
  ];

  const enquirySupervisorOptions = [
    { label: t('adminEnquiries:list.filters.allSupervisors'), value: '' },
    { label: t('adminEnquiries:list.unassigned'), value: 'unassigned' },
    ...supervisorOptions
  ];

  const enquiryTypeOptions = [
    { label: t('adminEnquiries:list.filters.allTypes'), value: '' },
    { label: t('adminEnquiries:list.types.enquiry'), value: 'enquiry' },
    { label: t('adminEnquiries:list.types.renewal'), value: 'renewal' }
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

        {/*
          * KP1-I55: one Clear only. This row used to carry an underlined "Clear"
          * link next to the heading that did exactly what the Clear button in
          * `filter-panel-actions` does — two controls, one behaviour.
          */}
        <div className="filter-panel-title">
          <h3>{t('transactions:filters.title')}</h3>
        </div>

        <div className="filter-panel-content">
          {/*
            * KP1-I65: the range can only be built forwards. `To` cannot go before a chosen
            * `From`, and `From` cannot go past a chosen `To` — the second half matters
            * because picking To first would otherwise leave an inverted range reachable,
            * which is the same defect from the other end. Both bounds are undefined until
            * their counterpart is set, so an empty panel still offers every date.
            */}
          <div className="filter-group">
            <label>{dateLabels?.from ?? t('transactions:filters.fromDate')}</label>
            <DatePicker
              value={fromDateValue}
              onChange={(date) => handleDateChange('fromDate', date)}
              format="DD/MM/YYYY"
              open={fromPicker.open}
              onOpen={fromPicker.onOpen}
              onClose={fromPicker.onClose}
              maxDate={fromMaxDate ?? undefined}
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
            <label>{dateLabels?.to ?? t('transactions:filters.toDate')}</label>
            <DatePicker
              value={toDateValue}
              onChange={(date) => handleDateChange('toDate', date)}
              format="DD/MM/YYYY"
              open={toPicker.open}
              onOpen={toPicker.onOpen}
              onClose={toPicker.onClose}
              minDate={fromDateValue ?? undefined}
              maxDate={latestSelectable ?? undefined}
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

          {/* Caller-defined dropdowns, driven by the module's own table columns. */}
          {useCustomFields && fields!.map((field) => (
            <div className="filter-group" key={field.key}>
              <label>{field.label}</label>
              <StyledAutocomplete
                options={field.options}
                getOptionLabel={(option: any) => option.label || ''}
                isOptionEqualToValue={(option: any, value: any) => {
                  if (typeof value === 'string') return option.value === value;
                  return option.value === value.value;
                }}
                value={field.options.find(opt => opt.value === (filters[field.key] ?? '')) || null}
                onChange={(_, newValue: any) => handleInputChange(field.key, newValue?.value ?? '')}
                renderInput={(params) => (
                  <StyledTextField {...params} placeholder={field.placeholder ?? selectPlaceholder} />
                )}
              />
            </div>
          ))}

          {!useCustomFields && mode === 'transaction' && (
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
                />
              </div>
            </>
          )}

          {!useCustomFields && mode === 'request' && (
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
                />
              </div>

              <div className="filter-group">
                <label>{t('transactions:filters.preferredDate')}</label>
                <DatePicker
                  value={filters.preferredDate ? dayjs(filters.preferredDate, 'DD/MM/YYYY') : null}
                  onChange={(date) => handleDateChange('preferredDate', date)}
                  format="DD/MM/YYYY"
                  open={preferredDatePicker.open}
                  onOpen={preferredDatePicker.onOpen}
                  onClose={preferredDatePicker.onClose}
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
                  open={preferredTimePicker.open}
                  onOpen={preferredTimePicker.onOpen}
                  onClose={preferredTimePicker.onClose}
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

          {!useCustomFields && mode === 'customer' && (
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
                />
              </div>
            </>
          )}

          {!useCustomFields && mode === 'enquiry' && (
            <>
              <div className="filter-group">
                <label>{t('adminEnquiries:list.filters.status')}</label>
                <StyledAutocomplete
                  options={enquiryStatusOptions}
                  getOptionLabel={(option: any) => option.label || ''}
                  isOptionEqualToValue={(option: any, value: any) => {
                    if (typeof value === 'string') return option.value === value;
                    return option.value === value.value;
                  }}
                  value={enquiryStatusOptions.find(opt => opt.value === filters.status) || null}
                  onChange={(_, newValue: any) => handleInputChange('status', newValue?.value ?? '')}
                  renderInput={(params) => (
                    <StyledTextField {...params} placeholder={t('adminEnquiries:form.placeholders.select')} />
                  )}
                />
              </div>

              <div className="filter-group">
                <label>{t('adminEnquiries:list.filters.supervisor')}</label>
                <StyledAutocomplete
                  options={enquirySupervisorOptions}
                  getOptionLabel={(option: any) => option.label || ''}
                  isOptionEqualToValue={(option: any, value: any) => {
                    if (typeof value === 'string') return option.value === value;
                    return option.value === value.value;
                  }}
                  value={enquirySupervisorOptions.find(opt => opt.value === filters.supervisor) || null}
                  onChange={(_, newValue: any) => handleInputChange('supervisor', newValue?.value ?? '')}
                  renderInput={(params) => (
                    <StyledTextField {...params} placeholder={t('adminEnquiries:form.placeholders.select')} />
                  )}
                />
              </div>

              <div className="filter-group">
                <label>{t('adminEnquiries:list.filters.enquiryType')}</label>
                <StyledAutocomplete
                  options={enquiryTypeOptions}
                  getOptionLabel={(option: any) => option.label || ''}
                  isOptionEqualToValue={(option: any, value: any) => {
                    if (typeof value === 'string') return option.value === value;
                    return option.value === value.value;
                  }}
                  value={enquiryTypeOptions.find(opt => opt.value === filters.enquiryType) || null}
                  onChange={(_, newValue: any) => handleInputChange('enquiryType', newValue?.value ?? '')}
                  renderInput={(params) => (
                    <StyledTextField {...params} placeholder={t('adminEnquiries:form.placeholders.select')} />
                  )}
                />
              </div>
            </>
          )}

          {!useCustomFields && mode === 'feedback' && (
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
