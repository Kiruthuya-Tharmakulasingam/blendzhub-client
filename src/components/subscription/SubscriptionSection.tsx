"use client";

import { useEffect, useState } from "react";
import { subscriptionService } from "@/services/subscription.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  Calendar,
  X
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface SubscriptionData {
  subscription: {
    _id: string;
    bookingCount: number;
    totalAmount: number;
    status: string;
    billingCycleStart: string;
    billingCycleEnd: string;
  };
  salon: {
    name: string;
    subscriptionStatus: string;
    subscriptionExpiresAt: string;
  };
  pricing: {
    pricePerBooking: number;
  };
}

interface PaymentHistoryItem {
  _id: string;
  year: number;
  month: number;
  bookingCount: number;
  totalAmount: number;
  paymentDate: string;
}

export default function SubscriptionSection() {
  const [status, setStatus] = useState<SubscriptionData | null>(null);
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statusRes, historyRes] = await Promise.all([
        subscriptionService.getStatus(),
        subscriptionService.getHistory()
      ]);
      setStatus(statusRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      console.error("Error fetching subscription data:", error);
      toast.error("Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !status) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  const { subscription, salon, pricing } = status;
  const isExpired = salon.subscriptionStatus === "expired";
  const isExpiringSoon = salon.subscriptionStatus === "expiring";

  const chartData = [
    { name: "Jan", bookings: 12 },
    { name: "Feb", bookings: 19 },
    { name: "Mar", bookings: 15 },
    { name: "Apr", bookings: 22 },
    { name: "May", bookings: 30 },
    { name: "Jun", bookings: subscription.bookingCount },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-yellow-500">Subscription & Billing</h1>
          <p className="text-gray-400">Manage your salon&apos;s subscription and payments</p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900 p-3 rounded-lg border border-zinc-800">
          <Calendar className="text-yellow-500 h-5 w-5" />
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Billing Period</p>
            <p className="text-sm font-medium">
              {new Date(subscription.billingCycleStart).toLocaleDateString()} - {new Date(subscription.billingCycleEnd).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {isExpired && (
        <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl flex items-center gap-4 animate-pulse">
          <AlertCircle className="text-red-500 h-8 w-8" />
          <div>
            <h3 className="text-red-500 font-bold">Subscription Expired</h3>
            <p className="text-red-200/80 text-sm">Your account is restricted. Please pay the outstanding amount to resume accepting appointments.</p>
          </div>
          <Button 
            className="ml-auto bg-red-600 hover:bg-red-700 text-white"
            onClick={() => setShowPaymentModal(true)}
          >
            Pay Now
          </Button>
        </div>
      )}

      {isExpiringSoon && !isExpired && (
        <div className="bg-yellow-900/20 border border-yellow-500/50 p-4 rounded-xl flex items-center gap-4">
          <Clock className="text-yellow-500 h-8 w-8" />
          <div>
            <h3 className="text-yellow-500 font-bold">Subscription Expiring Soon</h3>
            <p className="text-yellow-200/80 text-sm">Your subscription will expire in 5 days. Pay now to avoid any service interruption.</p>
          </div>
          <Button 
            className="ml-auto bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
            onClick={() => setShowPaymentModal(true)}
          >
            Renew Now
          </Button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900 border-zinc-800 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 className="h-24 w-24 text-yellow-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${isExpired ? 'bg-red-500' : 'bg-green-500'}`}></span>
              <div className="text-2xl font-bold capitalize">{salon.subscriptionStatus}</div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Valid until {new Date(salon.subscriptionExpiresAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="h-24 w-24 text-yellow-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">Monthly Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{subscription.bookingCount}</div>
            <p className="text-xs text-gray-500 mt-1">Total appointments this month</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-yellow-500/30 text-white overflow-hidden relative group border-2">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CreditCard className="h-24 w-24 text-yellow-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">Amount Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">Rs. {subscription.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Calculated at Rs. {pricing.pricePerBooking} per booking</p>
            {subscription.status !== "paid" && subscription.totalAmount > 0 && (
              <Button 
                className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                onClick={() => setShowPaymentModal(true)}
              >
                Pay Now
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart Section */}
        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="text-yellow-500 h-5 w-5" />
              Booking Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                    itemStyle={{ color: '#eab308' }}
                  />
                  <Bar dataKey="bookings" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#eab308' : '#3f3f46'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* History Section */}
        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="text-yellow-500 h-5 w-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.length > 0 ? (
                history.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-yellow-500/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <CheckCircle2 className="text-yellow-500 h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{new Date(item.year, item.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                        <p className="text-xs text-gray-500">{item.bookingCount} bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-500">Rs. {item.totalAmount.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Paid on {new Date(item.paymentDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No payment history found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-yellow-500">Complete Payment</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-zinc-800/50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Bookings</span>
                  <span className="font-medium">{subscription.bookingCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Price per Booking</span>
                  <span className="font-medium">Rs. {pricing.pricePerBooking}</span>
                </div>
                <div className="pt-2 border-t border-zinc-700 flex justify-between items-center">
                  <span className="font-bold">Total Amount</span>
                  <span className="text-xl font-bold text-yellow-500">Rs. {subscription.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <Elements stripe={stripePromise}>
                <PaymentForm 
                  subscriptionId={subscription._id} 
                  onSuccess={() => {
                    setShowPaymentModal(false);
                    fetchData();
                  }}
                />
              </Elements>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentForm({ subscriptionId, onSuccess }: { subscriptionId: string, onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      const { data } = await subscriptionService.createPaymentIntent(subscriptionId);
      const { clientSecret } = data;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else {
        if (result.paymentIntent.status === "succeeded") {
          await subscriptionService.confirmPayment(result.paymentIntent.id, subscriptionId);
          toast.success("Payment successful!");
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#fff',
                '::placeholder': { color: '#71717a' },
              },
              invalid: { color: '#ef4444' },
            },
          }}
        />
      </div>
      <Button 
        type="submit" 
        disabled={!stripe || processing} 
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-12 text-lg"
      >
        {processing ? "Processing..." : "Pay Now"}
      </Button>
      <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest">
        Secure payment powered by Stripe
      </p>
    </form>
  );
}
