import 'server-only';

import { getDb, images, payment, user, videos } from '@/db';
import { and, count, countDistinct, eq, gte, sql } from 'drizzle-orm';

const notDeleted = (table: typeof videos | typeof images) =>
  eq(table.isDeleted, false);

export type TimeRange = '1d' | '7d' | '30d' | '90d' | 'all';

function getDateFromRange(range: TimeRange): Date | null {
  if (range === 'all') return null;
  const now = new Date();
  const days = { '1d': 1, '7d': 7, '30d': 30, '90d': 90 }[range];
  now.setDate(now.getDate() - days);
  return now;
}

export interface AnalyticsStats {
  totalUsers: number;
  totalPayments: number;
  totalMedia: number;
  totalVideos: number;
  totalImages: number;
  creationConversion: number;
  paymentConversion: number;
  mediaSuccessRate: number;
  inactiveUsers: number;
}

export async function getStats(range: TimeRange): Promise<AnalyticsStats> {
  const db = await getDb();
  const since = getDateFromRange(range);

  const dateFilter = (col: Parameters<typeof gte>[0]) =>
    since ? gte(col, since) : undefined;

  const [
    usersResult,
    paymentsResult,
    videosResult,
    imagesResult,
    completedVideos,
    completedImages,
    finishedVideos,
    finishedImages,
    usersWithCreations,
    usersWithPayments,
  ] = await Promise.all([
    db.select({ value: count() }).from(user).where(dateFilter(user.createdAt)),
    db
      .select({ value: count() })
      .from(payment)
      .where(and(eq(payment.paid, true), dateFilter(payment.createdAt))),
    db
      .select({ value: count() })
      .from(videos)
      .where(and(notDeleted(videos), dateFilter(videos.createdAt))),
    db
      .select({ value: count() })
      .from(images)
      .where(and(notDeleted(images), dateFilter(images.createdAt))),
    // completed videos
    db
      .select({ value: count() })
      .from(videos)
      .where(and(notDeleted(videos), eq(videos.status, 'COMPLETED'), dateFilter(videos.createdAt))),
    // completed images
    db
      .select({ value: count() })
      .from(images)
      .where(and(notDeleted(images), eq(images.status, 'COMPLETED'), dateFilter(images.createdAt))),
    // finished videos (not PENDING/GENERATING)
    db
      .select({ value: count() })
      .from(videos)
      .where(
        and(
          notDeleted(videos),
          sql`${videos.status} IN ('COMPLETED', 'FAILED')`,
          dateFilter(videos.createdAt)
        )
      ),
    // finished images (not PENDING/GENERATING)
    db
      .select({ value: count() })
      .from(images)
      .where(
        and(
          notDeleted(images),
          sql`${images.status} IN ('COMPLETED', 'FAILED')`,
          dateFilter(images.createdAt)
        )
      ),
    // users with at least one creation (distinct across videos + images)
    db.execute(
      sql`SELECT COUNT(DISTINCT uid) as value FROM (
        SELECT ${videos.userId} as uid FROM ${videos} WHERE ${videos.isDeleted} = false ${since ? sql`AND ${videos.createdAt} >= ${since.toISOString()}` : sql``}
        UNION
        SELECT ${images.userId} as uid FROM ${images} WHERE ${images.isDeleted} = false ${since ? sql`AND ${images.createdAt} >= ${since.toISOString()}` : sql``}
      ) t`
    ),
    // users with payments
    db
      .select({ value: countDistinct(payment.userId) })
      .from(payment)
      .where(and(eq(payment.paid, true), dateFilter(payment.createdAt))),
  ]);

  const totalUsers = usersResult[0]?.value ?? 0;
  const totalPayments = paymentsResult[0]?.value ?? 0;
  const totalVideoCount = videosResult[0]?.value ?? 0;
  const totalImageCount = imagesResult[0]?.value ?? 0;
  const totalMedia = totalVideoCount + totalImageCount;
  const completedCount =
    (completedVideos[0]?.value ?? 0) + (completedImages[0]?.value ?? 0);
  const finishedCount =
    (finishedVideos[0]?.value ?? 0) + (finishedImages[0]?.value ?? 0);
  const usersWithCreationCount = Number(usersWithCreations[0]?.value ?? 0);
  const usersWithPaymentCount = usersWithPayments[0]?.value ?? 0;

  return {
    totalUsers,
    totalPayments,
    totalMedia,
    totalVideos: totalVideoCount,
    totalImages: totalImageCount,
    creationConversion:
      totalUsers > 0 ? usersWithCreationCount / totalUsers : 0,
    paymentConversion: totalUsers > 0 ? usersWithPaymentCount / totalUsers : 0,
    mediaSuccessRate: finishedCount > 0 ? completedCount / finishedCount : 0,
    inactiveUsers: Math.max(0, totalUsers - usersWithCreationCount),
  };
}

export interface FunnelStep {
  name: string;
  value: number;
}

export async function getFunnelData(range: TimeRange): Promise<FunnelStep[]> {
  const db = await getDb();
  const since = getDateFromRange(range);

  const dateFilter = (col: Parameters<typeof gte>[0]) =>
    since ? gte(col, since) : undefined;

  const [totalUsersResult, usersWithCreationsResult, usersWithSuccessResult] =
    await Promise.all([
      db
        .select({ value: count() })
        .from(user)
        .where(dateFilter(user.createdAt)),
      // Users who created at least one video or image
      db.execute(
        sql`SELECT COUNT(DISTINCT uid) as value FROM (
          SELECT ${videos.userId} as uid FROM ${videos} WHERE ${videos.isDeleted} = false ${since ? sql`AND ${videos.createdAt} >= ${since.toISOString()}` : sql``}
          UNION
          SELECT ${images.userId} as uid FROM ${images} WHERE ${images.isDeleted} = false ${since ? sql`AND ${images.createdAt} >= ${since.toISOString()}` : sql``}
        ) t`
      ),
      // Users who have at least one completed creation
      db.execute(
        sql`SELECT COUNT(DISTINCT uid) as value FROM (
          SELECT ${videos.userId} as uid FROM ${videos} WHERE ${videos.isDeleted} = false AND ${videos.status} = 'COMPLETED' ${since ? sql`AND ${videos.createdAt} >= ${since.toISOString()}` : sql``}
          UNION
          SELECT ${images.userId} as uid FROM ${images} WHERE ${images.isDeleted} = false AND ${images.status} = 'COMPLETED' ${since ? sql`AND ${images.createdAt} >= ${since.toISOString()}` : sql``}
        ) t`
      ),
    ]);

  return [
    { name: 'registered', value: totalUsersResult[0]?.value ?? 0 },
    {
      name: 'firstCreation',
      value: Number(usersWithCreationsResult[0]?.value ?? 0),
    },
    {
      name: 'firstSuccess',
      value: Number(usersWithSuccessResult[0]?.value ?? 0),
    },
  ];
}

export interface TrendPoint {
  date: string;
  registrations: number;
  creations: number;
  completions: number;
}

export async function getTrendData(range: TimeRange): Promise<TrendPoint[]> {
  const db = await getDb();
  const since = getDateFromRange(range === 'all' ? '30d' : range);

  const [regTrend, videoTrend, imageTrend, videoCompletions, imageCompletions] =
    await Promise.all([
      db.execute(
        sql`SELECT DATE(${user.createdAt}) as date, COUNT(*) as value
          FROM ${user}
          ${since ? sql`WHERE ${user.createdAt} >= ${since.toISOString()}` : sql``}
          GROUP BY DATE(${user.createdAt})
          ORDER BY date`
      ),
      db.execute(
        sql`SELECT DATE(${videos.createdAt}) as date, COUNT(*) as value
          FROM ${videos}
          WHERE ${videos.isDeleted} = false
          ${since ? sql`AND ${videos.createdAt} >= ${since.toISOString()}` : sql``}
          GROUP BY DATE(${videos.createdAt})
          ORDER BY date`
      ),
      db.execute(
        sql`SELECT DATE(${images.createdAt}) as date, COUNT(*) as value
          FROM ${images}
          WHERE ${images.isDeleted} = false
          ${since ? sql`AND ${images.createdAt} >= ${since.toISOString()}` : sql``}
          GROUP BY DATE(${images.createdAt})
          ORDER BY date`
      ),
      db.execute(
        sql`SELECT DATE(${videos.createdAt}) as date, COUNT(*) as value
          FROM ${videos}
          WHERE ${videos.isDeleted} = false AND ${videos.status} = 'COMPLETED'
          ${since ? sql`AND ${videos.createdAt} >= ${since.toISOString()}` : sql``}
          GROUP BY DATE(${videos.createdAt})
          ORDER BY date`
      ),
      db.execute(
        sql`SELECT DATE(${images.createdAt}) as date, COUNT(*) as value
          FROM ${images}
          WHERE ${images.isDeleted} = false AND ${images.status} = 'COMPLETED'
          ${since ? sql`AND ${images.createdAt} >= ${since.toISOString()}` : sql``}
          GROUP BY DATE(${images.createdAt})
          ORDER BY date`
      ),
    ]);

  // Merge all data by date
  const dateMap = new Map<string, TrendPoint>();

  // Pre-fill all dates in range so chart has no gaps
  if (since) {
    const current = new Date(since);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    while (current <= today) {
      const d = current.toISOString().split('T')[0];
      dateMap.set(d, { date: d, registrations: 0, creations: 0, completions: 0 });
      current.setDate(current.getDate() + 1);
    }
  }

  for (const row of regTrend) {
    const d = String(row.date);
    const existing = dateMap.get(d) ?? {
      date: d,
      registrations: 0,
      creations: 0,
      completions: 0,
    };
    existing.registrations = Number(row.value);
    dateMap.set(d, existing);
  }

  for (const row of [...videoTrend, ...imageTrend]) {
    const d = String(row.date);
    const existing = dateMap.get(d) ?? {
      date: d,
      registrations: 0,
      creations: 0,
      completions: 0,
    };
    existing.creations += Number(row.value);
    dateMap.set(d, existing);
  }

  for (const row of [...videoCompletions, ...imageCompletions]) {
    const d = String(row.date);
    const existing = dateMap.get(d) ?? {
      date: d,
      registrations: 0,
      creations: 0,
      completions: 0,
    };
    existing.completions += Number(row.value);
    dateMap.set(d, existing);
  }

  return Array.from(dateMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

export interface DashboardStats {
  totalUsers: number;
  totalMedia: number;
  totalPayments: number;
  mediaSuccessRate: number;
  recentUsers: number;
  recentMedia: number;
  recentPayments: number;
  videoStatusCounts: { completed: number; failed: number; processing: number };
  imageStatusCounts: { completed: number; failed: number; generating: number };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = await getDb();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalUsersResult,
    totalVideosResult,
    totalImagesResult,
    totalPaymentsResult,
    recentUsersResult,
    recentVideosResult,
    recentImagesResult,
    recentPaymentsResult,
    completedMediaResult,
    finishedMediaResult,
    videoCompleted,
    videoFailed,
    videoProcessing,
    imageCompleted,
    imageFailed,
    imageGenerating,
  ] = await Promise.all([
    db.select({ value: count() }).from(user),
    db.select({ value: count() }).from(videos).where(notDeleted(videos)),
    db.select({ value: count() }).from(images).where(notDeleted(images)),
    db.select({ value: count() }).from(payment).where(eq(payment.paid, true)),
    db
      .select({ value: count() })
      .from(user)
      .where(gte(user.createdAt, sevenDaysAgo)),
    db
      .select({ value: count() })
      .from(videos)
      .where(and(notDeleted(videos), gte(videos.createdAt, sevenDaysAgo))),
    db
      .select({ value: count() })
      .from(images)
      .where(and(notDeleted(images), gte(images.createdAt, sevenDaysAgo))),
    db
      .select({ value: count() })
      .from(payment)
      .where(and(eq(payment.paid, true), gte(payment.createdAt, sevenDaysAgo))),
    // completed media
    db.execute(
      sql`SELECT (
        (SELECT COUNT(*) FROM ${videos} WHERE ${videos.isDeleted} = false AND ${videos.status} = 'COMPLETED') +
        (SELECT COUNT(*) FROM ${images} WHERE ${images.isDeleted} = false AND ${images.status} = 'COMPLETED')
      ) as value`
    ),
    // finished media
    db.execute(
      sql`SELECT (
        (SELECT COUNT(*) FROM ${videos} WHERE ${videos.isDeleted} = false AND ${videos.status} IN ('COMPLETED', 'FAILED')) +
        (SELECT COUNT(*) FROM ${images} WHERE ${images.isDeleted} = false AND ${images.status} IN ('COMPLETED', 'FAILED'))
      ) as value`
    ),
    // Video status counts
    db
      .select({ value: count() })
      .from(videos)
      .where(and(notDeleted(videos), eq(videos.status, 'COMPLETED'))),
    db
      .select({ value: count() })
      .from(videos)
      .where(and(notDeleted(videos), eq(videos.status, 'FAILED'))),
    db
      .select({ value: count() })
      .from(videos)
      .where(and(notDeleted(videos), sql`${videos.status} IN ('PENDING', 'GENERATING', 'UPLOADING')`)),
    db
      .select({ value: count() })
      .from(images)
      .where(and(notDeleted(images), eq(images.status, 'COMPLETED'))),
    db
      .select({ value: count() })
      .from(images)
      .where(and(notDeleted(images), eq(images.status, 'FAILED'))),
    db
      .select({ value: count() })
      .from(images)
      .where(and(notDeleted(images), sql`${images.status} IN ('PENDING', 'GENERATING')`)),
  ]);

  const completedCount = Number(completedMediaResult[0]?.value ?? 0);
  const finishedCount = Number(finishedMediaResult[0]?.value ?? 0);

  return {
    totalUsers: totalUsersResult[0]?.value ?? 0,
    totalMedia:
      (totalVideosResult[0]?.value ?? 0) + (totalImagesResult[0]?.value ?? 0),
    totalPayments: totalPaymentsResult[0]?.value ?? 0,
    mediaSuccessRate: finishedCount > 0 ? completedCount / finishedCount : 0,
    recentUsers: recentUsersResult[0]?.value ?? 0,
    recentMedia:
      (recentVideosResult[0]?.value ?? 0) + (recentImagesResult[0]?.value ?? 0),
    recentPayments: recentPaymentsResult[0]?.value ?? 0,
    videoStatusCounts: {
      completed: videoCompleted[0]?.value ?? 0,
      failed: videoFailed[0]?.value ?? 0,
      processing: videoProcessing[0]?.value ?? 0,
    },
    imageStatusCounts: {
      completed: imageCompleted[0]?.value ?? 0,
      failed: imageFailed[0]?.value ?? 0,
      generating: imageGenerating[0]?.value ?? 0,
    },
  };
}
