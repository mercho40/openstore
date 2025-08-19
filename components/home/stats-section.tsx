import { getFormattedSiteStats } from "@/actions/stats";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsSectionProps {
  dict: {
    stats: {
      products: string;
      categories: string;
      customers: string;
      orders: string;
    };
  };
}

function StatSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-16 mx-auto bg-primary-foreground/20" />
      <Skeleton className="h-4 w-20 mx-auto bg-primary-foreground/20" />
    </div>
  );
}

async function StatsContent({ dict }: StatsSectionProps) {
  const stats = await getFormattedSiteStats();
  
  const statsArray = [
    {
      number: stats.products,
      label: dict.stats.products,
    },
    {
      number: stats.categories,
      label: dict.stats.categories,
    },
    {
      number: stats.customers,
      label: dict.stats.customers,
    },
    {
      number: stats.orders,
      label: dict.stats.orders,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
      {statsArray.map((stat, index) => (
        <div key={index} className="space-y-2">
          <div className="text-3xl lg:text-4xl font-bold">
            {stat.number}
          </div>
          <div className="text-sm lg:text-base opacity-90">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsSection({ dict }: StatsSectionProps) {

  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <Suspense 
          fallback={
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {Array.from({ length: 4 }).map((_, i) => (
                <StatSkeleton key={i} />
              ))}
            </div>
          }
        >
          <StatsContent dict={dict} />
        </Suspense>
      </div>
    </section>
  );
}