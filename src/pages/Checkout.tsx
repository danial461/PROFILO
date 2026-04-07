import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api, SubscriptionTier } from '../lib/api';
import { Upload, CheckCircle, CreditCard, Building, Smartphone } from 'lucide-react';

export default function Checkout() {
  const { tier } = useParams<{ tier: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [method, setMethod] = useState<'jazzcash' | 'easypaisa' | 'bank'>('easypaisa');
  const [receipt, setReceipt] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const prices: Record<string, string> = {
    monthly: '1,000',
    quarterly: '3,500',
    yearly: '9,000'
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceipt(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !receipt || !tier) return;
    
    setIsSubmitting(true);
    try {
      await api.submitPayment({
        userId: user.id,
        userName: user.name,
        tier: tier as SubscriptionTier,
        method,
        receiptImage: receipt
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error(error);
      alert('Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Submitted!</h2>
          <p className="text-gray-600 mb-6">Your receipt has been uploaded successfully. Our team will verify it and activate your {tier} subscription shortly.</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
        <p className="text-gray-600 mt-2">You are subscribing to the <span className="font-bold capitalize text-blue-600">{tier}</span> plan for ₨ {prices[tier || 'monthly']}.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 mb-4">1. Select Payment Method</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setMethod('easypaisa')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-colors ${method === 'easypaisa' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}
            >
              <Smartphone className={`w-8 h-8 mb-2 ${method === 'easypaisa' ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="font-medium text-gray-900">EasyPaisa</span>
            </button>
            <button
              onClick={() => setMethod('jazzcash')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-colors ${method === 'jazzcash' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}
            >
              <Smartphone className={`w-8 h-8 mb-2 ${method === 'jazzcash' ? 'text-red-600' : 'text-gray-400'}`} />
              <span className="font-medium text-gray-900">JazzCash</span>
            </button>
            <button
              onClick={() => setMethod('bank')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-colors ${method === 'bank' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
            >
              <Building className={`w-8 h-8 mb-2 ${method === 'bank' ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="font-medium text-gray-900">Bank Transfer</span>
            </button>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">2. Transfer Details</h2>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            {method === 'easypaisa' && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Account Title</p>
                <p className="font-bold text-gray-900 mb-3">PROFILO Education</p>
                <p className="text-sm text-gray-500 mb-1">EasyPaisa Account Number</p>
                <p className="font-bold text-xl text-gray-900 tracking-wider">0345 1234567</p>
              </div>
            )}
            {method === 'jazzcash' && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Account Title</p>
                <p className="font-bold text-gray-900 mb-3">PROFILO Education</p>
                <p className="text-sm text-gray-500 mb-1">JazzCash Account Number</p>
                <p className="font-bold text-xl text-gray-900 tracking-wider">0300 7654321</p>
              </div>
            )}
            {method === 'bank' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Bank Name</p>
                  <p className="font-bold text-gray-900">Meezan Bank</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Account Title</p>
                  <p className="font-bold text-gray-900">PROFILO Education (SMC-Pvt) Ltd</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">IBAN</p>
                  <p className="font-bold text-lg text-gray-900 tracking-wider">PK34 MEZN 0001 2345 6789 01</p>
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-amber-600 mt-4 font-medium flex items-center gap-2">
            Please transfer exactly ₨ {prices[tier || 'monthly']} and take a screenshot of the successful transaction.
          </p>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">3. Upload Receipt</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {receipt ? (
                    <img src={receipt} alt="Receipt preview" className="h-32 object-contain mb-2" />
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} required />
              </label>
            </div>
            
            <button
              type="submit"
              disabled={!receipt || isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Payment for Verification'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
