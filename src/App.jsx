import React, { useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';

// Validation Schemas
const step1Schema = Yup.object({
  firstName: Yup.string().required('First name is required').max(50, 'Too long'),
  lastName: Yup.string().required('Last name is required').max(50, 'Too long'),
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscore'),
  dateOfBirth: Yup.date()
    .required('Date of birth is required')
    .max(new Date(), 'Date cannot be in the future')
    .test('age', 'You must be at least 13 years old', function(value) {
      if (!value) return false;
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      return age >= 13;
    })
});

const step2Schema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^[+]?[\d\s\-()]{7,20}$/, 'Enter a valid phone number (digits, spaces, +, -, ())'),
  alternatePhone: Yup.string().nullable()
    .matches(/^[+]?[\d\s\-()]{0,20}$/, 'Invalid phone format (optional)')
});

const step3Schema = Yup.object({
  country: Yup.string().required('Country is required'),
  stateProvince: Yup.string().required('State/Province is required'),
  city: Yup.string().required('City is required'),
  postalCode: Yup.string()
    .required('Postal code is required')
    .matches(/^[A-Za-z0-9\s\-]{3,12}$/, 'Postal code format invalid'),
  streetAddress: Yup.string().required('Street address is required'),
  apartmentSuite: Yup.string().nullable()
});

const step4Schema = Yup.object({
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(/[A-Za-z0-9]/, 'Password must contain letters/numbers'),
  confirmPassword: Yup.string()
    .required('Please confirm password')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
  acceptTerms: Yup.boolean()
    .oneOf([true], 'You must accept the terms & conditions')
});

const getValidationSchema = (step) => {
  switch(step) {
    case 0: return step1Schema;
    case 1: return step2Schema;
    case 2: return step3Schema;
    case 3: return step4Schema;
    default: return Yup.object({});
  }
};

// Reusable Input Field Component
const InputField = ({ label, name, type = "text", placeholder, formik, optional = false, helper = "" }) => {
  const { values, errors, touched, handleChange, handleBlur } = formik;
  const hasError = touched[name] && errors[name];
  
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-700 flex items-center gap-1">
        {label} {!optional && <span className="text-red-500 text-xs">*</span>}
        {helper && <span className="text-gray-400 text-xs font-normal ml-1">({helper})</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={values[name] || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-300 transition-all bg-gray-50 focus:bg-white ${hasError ? 'border-red-400 ring-1 ring-red-200' : 'border-gray-300'}`}
      />
      {hasError && (
        <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <i className="fas fa-exclamation-circle text-[10px]"></i> {errors[name]}
        </div>
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;

  const initialValues = {
    firstName: '',
    lastName: '',
    username: '',
    dateOfBirth: '',
    email: '',
    phoneNumber: '',
    alternatePhone: '',
    country: '',
    stateProvince: '',
    city: '',
    postalCode: '',
    streetAddress: '',
    apartmentSuite: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  };

  const handleFinalSubmit = (values, { setSubmitting, resetForm }) => {
    console.log('Final Form Values:', values);
    alert(JSON.stringify(values, null, 2));
    setSubmitting(false);
    
    if(window.confirm('Form submitted successfully! Do you want to reset the form?')) {
      resetForm();
      setCurrentStep(0);
    }
  };

  const renderStepContent = (formik) => {
    switch(currentStep) {
      case 0: 
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-700 border-l-4 border-indigo-400 pl-3">
              📝 Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="First Name" name="firstName" placeholder="John" formik={formik} />
              <InputField label="Last Name" name="lastName" placeholder="Doe" formik={formik} />
            </div>
            <InputField label="Username" name="username" placeholder="cool_john123" formik={formik} />
            <InputField 
              label="Date of Birth" 
              name="dateOfBirth" 
              type="date" 
              placeholder="YYYY-MM-DD" 
              formik={formik} 
              helper="Must be at least 13 years old" 
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-700 border-l-4 border-indigo-400 pl-3">
              📞 Contact Information
            </h3>
            <InputField label="Email Address" name="email" type="email" placeholder="hello@example.com" formik={formik} />
            <InputField label="Phone Number" name="phoneNumber" placeholder="+1 234 567 8900" formik={formik} />
            <InputField label="Alternate Phone (Optional)" name="alternatePhone" placeholder="Optional phone" formik={formik} optional />
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-700 border-l-4 border-indigo-400 pl-3">
              🏠 Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Country" name="country" placeholder="United States" formik={formik} />
              <InputField label="State/Province" name="stateProvince" placeholder="California" formik={formik} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="City" name="city" placeholder="San Francisco" formik={formik} />
              <InputField label="Postal Code" name="postalCode" placeholder="94105" formik={formik} />
            </div>
            <InputField label="Street Address" name="streetAddress" placeholder="123 Main Street" formik={formik} />
            <InputField label="Apartment/Suite (Optional)" name="apartmentSuite" placeholder="Apt 4B" formik={formik} optional />
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-700 border-l-4 border-indigo-400 pl-3">
              🔐 Account Security
            </h3>
            <InputField label="Password" name="password" type="password" placeholder="••••••" formik={formik} />
            <InputField label="Confirm Password" name="confirmPassword" type="password" placeholder="Confirm password" formik={formik} />
            <div className="mt-4 pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formik.values.acceptTerms}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="mt-1 w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-gray-700 text-sm">
                  I accept the <span className="font-semibold text-indigo-600">Terms & Conditions</span> and Privacy Policy.
                  {formik.touched.acceptTerms && formik.errors.acceptTerms && 
                    <span className="block text-red-500 text-xs mt-1">{formik.errors.acceptTerms}</span>
                  }
                </span>
              </label>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-100 transition-all">
      {/* Header with Stepper Progress Bar */}
      <div className="px-6 pt-8 pb-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <i className="fas fa-layer-group text-indigo-500"></i> 
          Formik Multi-Step Form
        </h2>
        <p className="text-gray-500 text-sm mt-1">Complete your profile – step {currentStep+1} of {totalSteps}</p>
        
        {/* Step indicator progress bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 h-1 bg-gray-200 w-full -translate-y-1/2 rounded-full"></div>
            <div 
              className="absolute left-0 top-1/2 h-1 bg-indigo-600 -translate-y-1/2 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
            ></div>
            
            {[...Array(totalSteps)].map((_, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (idx <= currentStep) setCurrentStep(idx);
                    else alert("Please complete current step first.");
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all shadow-md
                    ${idx === currentStep ? 'bg-indigo-600 text-white ring-4 ring-indigo-200' : 
                      (idx < currentStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500')}
                  `}
                >
                  {idx < currentStep ? <i className="fas fa-check text-xs"></i> : idx+1}
                </button>
                <span className="text-xs mt-2 font-medium text-gray-600 hidden sm:block">
                  {idx === 0 ? "Personal" : idx === 1 ? "Contact" : idx === 2 ? "Address" : "Security"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formik Form */}
      <Formik
        initialValues={initialValues}
        validationSchema={getValidationSchema(currentStep)}
        onSubmit={(values, formikBag) => {
          if (currentStep === totalSteps - 1) {
            handleFinalSubmit(values, formikBag);
          } else {
            if (formikBag.isValid) {
              setCurrentStep(prev => prev + 1);
              formikBag.setSubmitting(false);
            } else {
              formikBag.setSubmitting(false);
            }
          }
        }}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {(formik) => {
          const handleNext = async () => {
            const validationSchema = getValidationSchema(currentStep);
            try {
              await validationSchema.validate(formik.values, { abortEarly: false });
              if (currentStep < totalSteps - 1) {
                setCurrentStep(s => s + 1);
              } else {
                formik.handleSubmit();
              }
            } catch (err) {
              const yupErrors = {};
              err.inner.forEach(e => {
                yupErrors[e.path] = e.message;
              });
              formik.setErrors(yupErrors);
              const fieldsToTouch = Object.keys(yupErrors);
              const touchedObj = {};
              fieldsToTouch.forEach(f => { touchedObj[f] = true; });
              formik.setTouched({ ...formik.touched, ...touchedObj });
            }
          };

          const handleBack = () => {
            if (currentStep > 0) setCurrentStep(s => s - 1);
          };

          return (
            <form onSubmit={formik.handleSubmit} className="px-6 py-6 bg-white">
              {renderStepContent(formik)}
              
              <div className="flex justify-between items-center mt-10 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition shadow-sm ${
                    currentStep === 0 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <i className="fas fa-arrow-left text-sm"></i> Back
                </button>
                
                {currentStep === totalSteps - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={formik.isSubmitting}
                    className="px-8 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-md flex items-center gap-2 transition disabled:opacity-70"
                  >
                    {formik.isSubmitting ? 
                      <i className="fas fa-spinner fa-spin"></i> : 
                      <><i className="fas fa-check-circle"></i> Submit Form</>
                    }
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md flex items-center gap-2 transition"
                  >
                    Next <i className="fas fa-arrow-right text-sm"></i>
                  </button>
                )}
              </div>
              
             
            </form>
          );
        }}
      </Formik>
    </div>
  );
};

export default App;