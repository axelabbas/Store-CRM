import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Users, UserPlus, Calendar, TrendingUp, Cake, Edit, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '../lib/translations';

interface Stats {
  totalCustomers: number;
  upcomingBirthdays: number;
  recentCustomers: number;
  birthdaysToday: number;
  birthdaysThisMonth: number;
  totalEdits: number;
  customersWithEmail: number;
  customersWithPhone: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    upcomingBirthdays: 0,
    recentCustomers: 0,
    birthdaysToday: 0,
    birthdaysThisMonth: 0,
    totalEdits: 0,
    customersWithEmail: 0,
    customersWithPhone: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const customersSnapshot = await getDocs(collection(db, 'customers'));
        const totalCustomers = customersSnapshot.size;

        // Calculate upcoming birthdays (next 30 days)
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        let upcomingBirthdays = 0;
        let birthdaysToday = 0;
        let birthdaysThisMonth = 0;
        let totalEdits = 0;
        let customersWithEmail = 0;
        let customersWithPhone = 0;

        customersSnapshot.forEach((doc) => {
          const data = doc.data();

          // Birthday calculations
          if (data.birthday) {
            const birthday = new Date(data.birthday);
            const thisYearBirthday = new Date(
              now.getFullYear(),
              birthday.getMonth(),
              birthday.getDate()
            );

            // Upcoming birthdays (next 30 days)
            if (thisYearBirthday >= now && thisYearBirthday <= thirtyDaysFromNow) {
              upcomingBirthdays++;
            }

            // Birthdays today
            if (
              thisYearBirthday.getDate() === now.getDate() &&
              thisYearBirthday.getMonth() === now.getMonth()
            ) {
              birthdaysToday++;
            }

            // Birthdays this month
            if (thisYearBirthday.getMonth() === now.getMonth()) {
              birthdaysThisMonth++;
            }
          }

          // Count edits
          if (data.history && Array.isArray(data.history)) {
            totalEdits += data.history.filter((h: { action?: string }) => h.action === 'edited').length;
          }

          // Count customers with contact info
          if (data.email) customersWithEmail++;
          if (data.phone) customersWithPhone++;
        });

        // Get recent customers (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        let recentCustomers = 0;

        customersSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.createdAt) {
            const createdAt = data.createdAt.toDate();
            if (createdAt >= sevenDaysAgo) {
              recentCustomers++;
            }
          }
        });

        setStats({
          totalCustomers,
          upcomingBirthdays,
          recentCustomers,
          birthdaysToday,
          birthdaysThisMonth,
          totalEdits,
          customersWithEmail,
          customersWithPhone,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="space-y-6">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">{t('Customer Relationship Management')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t('Manage your customers with elegance and simplicity')}
          </p>
        </div>
        <div className="flex gap-4 pt-2">
          <Button asChild size="lg">
            <Link to="/add-customer">
              <UserPlus className="ml-2 h-5 w-5" />
              {t('Add Customer Button')}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/customers">
              <Users className="ml-2 h-5 w-5" />
              {t('View All Customers')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Section - Row 1 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('Total Customers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.totalCustomers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('All registered customers')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('Customers with Email')}</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.customersWithEmail}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('Have email addresses')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('Customers with Phone')}</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.customersWithPhone}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('Have phone numbers')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Section - Row 2 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('New This Week')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.recentCustomers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('Added in the last 7 days')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('Total Edits')}</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.totalEdits}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('Customer record updates')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('Birthdays This Month')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.birthdaysThisMonth}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('In the current month')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('Birthdays Today')}</CardTitle>
            <Cake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.birthdaysToday}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('Celebrating today')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>{t('Ready to grow your business?')}</CardTitle>
          <CardDescription>
            {t('Start building meaningful relationships with your customers today')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/add-customer">
              <UserPlus className="ml-2 h-4 w-4" />
              {t('Add Your First Customer')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}