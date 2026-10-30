import { BookOpen, Clock, CheckCircle, Package, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface BookListing {
  id: string;
  title: string;
  category?: string;
  condition: string;
  originalPrice?: number;
  sellingPrice: number;
  status: string;
  createdAt?: string;
}

interface SellerDashboardProps {
  userName?: string;
  userEmail?: string;
  userListings: BookListing[];
  onBackToMarketplace: () => void;
}

export function SellerDashboard({
  userName = "Rishi Vishwakarma",
  userEmail = "rishi@example.com",
  userListings = [],
  onBackToMarketplace
}: SellerDashboardProps) {
  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
     {/* Navigation Back Button */}
    <button
    onClick={onBackToMarketplace}
    className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 mb-6 transition-colors"
    >
  <ArrowLeft className="size-4" />
    Back to Marketplace
   </button>

   {/* Dashboard Grid Header & Layout */}
  <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          
   {/* LEFT SIDEBAR: User Profile Card */}
    <div className="flex flex-col gap-6">
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
     <div className="flex flex-col items-center text-center">      <div className="flex size-20 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700 mb-4">
      {userName.charAt(0)}
         </div>
                <h3 className="text-lg font-bold text-slate-900">{userName}</h3>
                <p className="text-xs text-slate-500 mb-4">{userEmail}</p>

      <div className="w-full border-t border-slate-100 pt-4 flex justify-around">
                  <div className="text-center">
                    <p className="text-xl font-extrabold text-slate-900">{userListings.length}</p>
                    <p className="text-xs text-slate-500 font-medium">Total Books</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-extrabold text-amber-600">
                      {userListings.filter(b => b.status === 'Pending Admin Review').length}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">Pending</p>
                  </div>
                </div>
              </div>
            </div>
    </div>

  {/* RIGHT MAIN AREA: My Book Listings */}
  <div className="flex flex-col gap-6">
     <div className="flex items-center justify-between">
     <div>
     <h2 className="text-2xl font-extrabold text-slate-900">My Listed Books</h2>
         <p className="text-sm text-slate-500">Track and manage your posted books here.</p>
              </div>
            </div>

            {/* Empty State Check */}
            {userListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
                <Package className="size-12 text-slate-300 mb-3" />
                <h3 className="text-base font-semibold text-slate-800">No books listed yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mb-4">
                  You haven't posted any books for sale. Go to the marketplace landing page to list your used books.
                </p>
                <Button onClick={onBackToMarketplace} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm">
                  List Your First Book
                </Button>
        </div>
            ) : (
              /* Book Listings List */
       <div className="flex flex-col gap-4">
                {userListings.map((book) => (
                  <div
                    key={book.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-shadow gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <BookOpen className="size-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{book.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium">{book.category || 'General'}</span>
                          <span>•</span>
                          <span>Condition: {book.condition}</span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-lg font-extrabold text-emerald-600">₹{book.sellingPrice}</span>
                          {book.originalPrice != null && book.originalPrice > 0 && (
                            <span className="text-xs text-slate-400 line-through">₹{book.originalPrice}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Status Badge */}
                    <div className="self-end sm:self-center">
                      {book.status === 'Pending Admin Review' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 border border-amber-200/60">
                          <Clock className="size-3.5" />
                          Pending Admin Review
                        </span>
                      ) : book.status === 'Live on Marketplace' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                          <CheckCircle className="size-3.5" />
                          Live on Marketplace
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                          book.status === 'Sold Out'
                            ? 'border border-slate-200 bg-slate-100 text-slate-700'
                            : 'border border-red-200 bg-red-50 text-red-700'
                        }`}>
                          {book.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}