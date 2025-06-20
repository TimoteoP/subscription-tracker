import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { calculateMonthlyCost, getCategoryBreakdown } from '@/lib/calculations';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'pdf';
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const { data: categories } = await supabase
      .from('categories')
      .select('*');

    const categoryMap = categories?.reduce((map, category) => {
      map[category.id] = category.name;
      return map;
    }, {} as Record<string, string>) || {};

    if (format === 'pdf') {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([550, 750]);
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Add title
      page.drawText('Subscription Report', {
        x: 50,
        y: height - 50,
        size: 20,
        font,
        color: rgb(0, 0, 0),
      });

      // Add summary
      const activeSubs = subscriptions.filter(sub => sub.status === 'active');
      const monthlyCost = calculateMonthlyCost(activeSubs);
      const yearlyCost = monthlyCost * 12;
      const breakdown = getCategoryBreakdown(activeSubs);

      let y = height - 100;
      page.drawText(`Total Active Subscriptions: ${activeSubs.length}`, { x: 50, y, size: 12, font });
      y -= 20;
      page.drawText(`Monthly Cost: $${monthlyCost.toFixed(2)}`, { x: 50, y, size: 12, font });
      y -= 20;
      page.drawText(`Yearly Cost: $${yearlyCost.toFixed(2)}`, { x: 50, y, size: 12, font });
      y -= 30;

      // Add category breakdown
      page.drawText('Category Breakdown:', { x: 50, y, size: 14, font, color: rgb(0, 0, 0.5) });
      y -= 20;

      for (const [categoryId, data] of Object.entries(breakdown)) {
        page.drawText(`${categoryMap[categoryId] || 'Unknown'}: ${data.count} subs, $${data.cost.toFixed(2)}/month`, {
          x: 50,
          y,
          size: 12,
          font,
        });
        y -= 15;
      }

      y -= 20;

      // Add subscriptions list
      page.drawText('Your Subscriptions:', { x: 50, y, size: 14, font, color: rgb(0, 0, 0.5) });
      y -= 20;

      subscriptions.forEach(sub => {
        const text = [
          `${sub.name} (${categoryMap[sub.category_id] || 'Unknown'})`,
          `Status: ${sub.status}`,
          `Cost: $${sub.cost.toFixed(2)} ${sub.billing_cycle}`,
          `Start: ${new Date(sub.start_date).toLocaleDateString()}`,
          `End: ${new Date(sub.end_date).toLocaleDateString()}`,
        ].join(' - ');

        if (y < 50) {
          // Add new page if we're running out of space
          y = height - 50;
          page.drawText('(continued on next page)', { x: 50, y, size: 10, font });
          y -= 20;
        }

        page.drawText(text, { x: 50, y, size: 10, font });
        y -= 15;
      });

      const pdfBytes = await pdfDoc.save();
      return new NextResponse(pdfBytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="subscriptions.pdf"',
        },
      });
    } else {
      // CSV export
      const headers = [
        'Name',
        'Category',
        'Description',
        'Start Date',
        'End Date',
        'Cost',
        'Billing Cycle',
        'Status',
        'Date Canceled',
      ];

      const rows = subscriptions.map(sub => [
        sub.name,
        categoryMap[sub.category_id] || 'Unknown',
        sub.description || '',
        new Date(sub.start_date).toISOString().split('T')[0],
        new Date(sub.end_date).toISOString().split('T')[0],
        sub.cost.toString(),
        sub.billing_cycle,
        sub.status,
        sub.date_canceled ? new Date(sub.date_canceled).toISOString().split('T')[0] : '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="subscriptions.csv"',
        },
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    );
  }
}