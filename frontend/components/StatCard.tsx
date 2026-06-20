import { Paper, Text, SimpleGrid, ThemeIcon } from '@mantine/core';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
}

export function StatCard({ title, value, icon, color = 'blue', subtitle }: StatCardProps) {
  return (
    <Paper p="md" radius="md" withBorder>
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
}
