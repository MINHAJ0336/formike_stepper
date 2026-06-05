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
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase & number'),
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

// Animated Input Field Component
const InputField = ({ label, name, type = "text", placeholder, formik, optional = false, helper = "", icon }) => {
  const { values, errors, touched, handleChange, handleBlur } = formik;
  const hasError = touched[name] && errors[name];
  
  return (
    <div className="group relative">
      <label className={`block text-sm font-semibold mb-2 transition-all duration-300 ${hasError ? 'text-red-500' : 'text-gray-700 group-focus-within:text-indigo-600'}`}>
        {icon && <span className="mr-2">{icon}</span>}
        {label} {!optional && <span className="text-red-500 text-xs">*</span>}
        {helper && <span className="text-gray-400 text-xs font-normal ml-1">({helper})</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={values[name] || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 
            focus:outline-none focus:ring-4 focus:ring-opacity-30
            ${hasError 
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50' 
              : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200 bg-gray-50 hover:bg-white'
            }
          `}
        />
        {hasError && (
          <div className="absolute right-3 top-3 text-red-400">
            <i className="fas fa-exclamation-circle"></i>
          </div>
        )}
      </div>
      {hasError && (
        <div className="mt-1 text-red-500 text-xs flex items-center gap-1 animate-pulse">
          <i className="fas fa-exclamation-triangle text-[10px]"></i> {errors[name]}
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
    
    // Success animation
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Success!';
      submitBtn.classList.add('bg-green-600');
    }
    
    setTimeout(() => {
      alert(`✨ Form Submitted Successfully! ✨\n\n${JSON.stringify(values, null, 2)}`);
      setSubmitting(false);
      
      if(window.confirm('🎉 Form submitted successfully! Do you want to reset and start over?')) {
        resetForm();
        setCurrentStep(0);
      }
    }, 500);
  };

  const renderStepContent = (formik) => {
    switch(currentStep) {
      case 0: 
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <i className="fas fa-user text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Personal Information</h3>
                <p className="text-gray-500 text-sm">Tell us about yourself</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="First Name" name="firstName" placeholder="John" formik={formik} icon={<i className="fas fa-user"></i>} />
              <InputField label="Last Name" name="lastName" placeholder="Doe" formik={formik} icon={<i className="fas fa-user"></i>} />
            </div>
            <InputField label="Username" name="username" placeholder="cool_john123" formik={formik} icon={<i className="fas fa-at"></i>} />
            <InputField 
              label="Date of Birth" 
              name="dateOfBirth" 
              type="date" 
              placeholder="YYYY-MM-DD" 
              formik={formik} 
              helper="Must be at least 13 years old"
              icon={<i className="fas fa-calendar-alt"></i>}
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <i className="fas fa-phone-alt text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Contact Information</h3>
                <p className="text-gray-500 text-sm">How can we reach you?</p>
              </div>
            </div>
            <InputField label="Email Address" name="email" type="email" placeholder="hello@example.com" formik={formik} icon={<i className="fas fa-envelope"></i>} />
            <InputField label="Phone Number" name="phoneNumber" placeholder="+1 234 567 8900" formik={formik} icon={<i className="fas fa-mobile-alt"></i>} />
            <InputField label="Alternate Phone" name="alternatePhone" placeholder="Optional phone" formik={formik} optional icon={<i className="fas fa-phone"></i>} />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <i className="fas fa-map-marker-alt text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Address Information</h3>
                <p className="text-gray-500 text-sm">Where do you live?</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Country" name="country" placeholder="United States" formik={formik} icon={<i className="fas fa-globe-americas"></i>} />
              <InputField label="State/Province" name="stateProvince" placeholder="California" formik={formik} icon={<i className="fas fa-map"></i>} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="City" name="city" placeholder="San Francisco" formik={formik} icon={<i className="fas fa-city"></i>} />
              <InputField label="Postal Code" name="postalCode" placeholder="94105" formik={formik} icon={<i className="fas fa-mail-bulk"></i>} />
            </div>
            <InputField label="Street Address" name="streetAddress" placeholder="123 Main Street" formik={formik} icon={<i className="fas fa-road"></i>} />
            <InputField label="Apartment/Suite" name="apartmentSuite" placeholder="Apt 4B" formik={formik} optional icon={<i className="fas fa-building"></i>} />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
                <i className="fas fa-lock text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Account Security</h3>
                <p className="text-gray-500 text-sm">Secure your account</p>
              </div>
            </div>
            <InputField label="Password" name="password" type="password" placeholder="••••••••" formik={formik} icon={<i className="fas fa-key"></i>} />
            <InputField label="Confirm Password" name="confirmPassword" type="password" placeholder="Confirm password" formik={formik} icon={<i className="fas fa-check-circle"></i>} />
            
            <div className="mt-6 pt-4 border-t-2 border-gray-100">
              <label className="flex items-start gap-3 cursor-pointer group p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl hover:shadow-md transition-all">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formik.values.acceptTerms}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="mt-1 w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                />
                <div className="text-sm">
                  <span className="font-semibold text-gray-800">I accept the Terms & Conditions</span>
                  <p className="text-gray-600 text-xs mt-1">By checking this box, you agree to our Terms of Service and Privacy Policy.</p>
                  {formik.touched.acceptTerms && formik.errors.acceptTerms && 
                    <span className="block text-red-500 text-xs mt-2 font-medium">{formik.errors.acceptTerms}</span>
                  }
                </div>
              </label>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const steps = [
    { name: "Personal", icon: "fas fa-user", color: "from-blue-500 to-blue-600" },
    { name: "Contact", icon: "fas fa-phone-alt", color: "from-green-500 to-green-600" },
    { name: "Address", icon: "fas fa-map-marker-alt", color: "from-purple-500 to-purple-600" },
    { name: "Security", icon: "fas fa-lock", color: "from-red-500 to-pink-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Floating Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-3xl">
          
          {/* Header with Animated Gradient */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                    <i className="fas fa-rocket"></i>
                    Create Account
                  </h1>
                  <p className="text-indigo-100 text-sm">Join our community today! 🎉</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <p className="text-white font-semibold">
                    Step {currentStep+1} of {totalSteps}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step Indicator with Animation */}
          <div className="px-8 pt-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between relative">
              {steps.map((step, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (idx <= currentStep) setCurrentStep(idx);
                      else alert("📝 Please complete current step first!");
                    }}
                    className="group focus:outline-none"
                  >
                    <div className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center 
                      transition-all duration-500 transform hover:scale-110
                      shadow-lg
                      ${idx === currentStep 
                        ? `bg-gradient-to-r ${step.color} ring-4 ring-opacity-50 ring-indigo-300 scale-110` 
                        : idx < currentStep 
                          ? 'bg-gradient-to-r from-green-400 to-green-500' 
                          : 'bg-gray-300'
                      }
                    `}>
                      {idx < currentStep ? (
                        <i className="fas fa-check text-white text-xl"></i>
                      ) : (
                        <i className={`${step.icon} text-${idx === currentStep ? 'white' : 'gray-500'} text-xl`}></i>
                      )}
                    </div>
                    <p className={`text-xs font-semibold mt-3 transition-all duration-300 ${idx === currentStep ? 'text-indigo-600 scale-105' : 'text-gray-500'}`}>
                      {step.name}
                    </p>
                  </button>
                  {idx < totalSteps - 1 && (
                    <div className="absolute top-7 left-1/2 w-full h-1 bg-gray-200 -z-0">
                      <div className={`h-full bg-gradient-to-r from-green-400 to-indigo-500 transition-all duration-500 ${idx < currentStep ? 'w-full' : 'w-0'}`}></div>
                    </div>
                  )}
                </div>
              ))}
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
                <form onSubmit={formik.handleSubmit} className="px-8 py-8 bg-white">
                  {renderStepContent(formik)}
                  
                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center mt-10 pt-6 border-t-2 border-gray-100">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={currentStep === 0}
                      className={`
                        px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300
                        ${currentStep === 0 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md transform hover:-translate-x-1'
                        }
                      `}
                    >
                      <i className="fas fa-arrow-left"></i> Back
                    </button>
                    
                    {currentStep === totalSteps - 1 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={formik.isSubmitting}
                        className="submit-btn px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50"
                      >
                        {formik.isSubmitting ? 
                          <><i className="fas fa-spinner fa-spin"></i> Submitting...</> : 
                          <><i className="fas fa-check-circle"></i> Submit Form</>
                        }
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                      >
                        Next <i className="fas fa-arrow-right"></i>
                      </button>
                    )}
                  </div>
                  
                  {/* Progress Bar and Helper Text */}
                  <div className="mt-6">
                    <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-center mt-3">
                      <p className="text-xs text-gray-500">
                        <i className="fas fa-lock text-gray-400 mr-1"></i> 
                        Your information is secure with us
                      </p>
                    </div>
                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default App;