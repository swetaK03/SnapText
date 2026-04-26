"use client";

import { useState } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Star, MessageSquarePlus, User as UserIcon, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  userName: string;
  userEmail: string;
  rating: number;
  reviewText: string;
  createdAt: any;
}

export default function ReviewsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reviewsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'reviews'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: reviews, isLoading: isReviewsLoading } = useCollection<Review>(reviewsQuery);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;
    if (!reviewText.trim()) {
      toast({ variant: "destructive", description: "Review text cannot be empty" });
      return;
    }

    setIsSubmitting(true);
    try {
      addDocumentNonBlocking(collection(firestore, 'reviews'), {
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        userEmail: user.email,
        rating,
        reviewText: reviewText,
        createdAt: serverTimestamp(),
      });
      setReviewText('');
      setRating(5);
      toast({ title: "Thank you!", description: "Your review has been posted." });
    } catch (error) {
      // Errors are handled by FirebaseErrorListener via addDocumentNonBlocking
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold font-headline text-primary">User Reviews</h1>
        <p className="text-muted-foreground">See what our users think about SnapText.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submit Review Form */}
        <div className="lg:col-span-1">
          {user ? (
            <Card className="sticky top-24 border-accent shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <MessageSquarePlus className="w-5 h-5 text-accent" />
                  Leave a Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                        >
                          <Star className={cn(
                            "w-6 h-6",
                            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted border-none"
                          )} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review">Your Review</Label>
                    <Textarea 
                      id="review"
                      placeholder="Share your experience..." 
                      className="min-h-[120px]"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                    {isSubmitting ? 'Posting...' : 'Submit Review'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-24 bg-primary/5 border-dashed border-primary">
              <CardContent className="p-8 text-center space-y-4">
                <UserIcon className="w-12 h-12 mx-auto text-primary opacity-50" />
                <p className="font-semibold">Log in to post a review</p>
                <Button asChild variant="default" className="w-full bg-primary">
                  <a href="/login">Go to Login</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {isReviewsLoading ? (
            <div className="text-center p-12">Loading reviews...</div>
          ) : !reviews || reviews.length === 0 ? (
            <div className="text-center p-12 bg-card rounded-lg border">
              <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {review.userName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary">{review.userName}</h4>
                      <div className="flex text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn("w-3.5 h-3.5", i < review.rating ? "fill-yellow-400" : "text-muted")} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.createdAt && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(review.createdAt.toDate())} ago
                    </span>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {review.reviewText}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
