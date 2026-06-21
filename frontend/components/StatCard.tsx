import { Paper, Text, SimpleGrid, ThemeIcon } from '@mantine/core';
import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
  href?: string;
}

export function StatCard({ title, value, icon, color = 'blue', subtitle, href }: StatCardProps) {
  const card = (
    <Paper
      p="md"
      radius="md"
      withBorder
      style={href ? { cursor: 'pointer', transition: 'all 0.2s' } : undefined}
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <div>
          <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text fw={700} size="xl" mt={5}>
            {value}
          </Text>
          {subtitle && (
            <Text size="xs" c="dimmed" mt={5}>
              {subtitle}
            </Text>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <ThemeIcon color={color} size={60} radius="md" variant="light">
            {icon}
          </ThemeIcon>
        </div>
      </SimpleGrid>
    </Paper>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
        {card}
      </Link>
    );
  }

  return card;
}
