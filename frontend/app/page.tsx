'use client';

import { useEffect, useState } from 'react';
import { Group, Title, SimpleGrid, Paper, Text, Alert } from '@mantine/core';
import {
  IconMapPin,
  IconUsers,
  IconClipboardCheck,
  IconPackage,
  IconTruck,
  IconPhoneCall,
  IconFileInvoice,
  IconAlertTriangle,
  IconCheck,
} from '@tabler/icons-react';
import { api } from '@/lib/api';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Statistics, Location, Material, FollowUp, CheckInRecord } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<Statistics>({});
  const [lowStockMaterials, setLowStockMaterials] = useState<Material[]>([]);
  const [pendingFollowUps, setPendingFollowUps] = useState<FollowUp[]>([]);
  const [unconfirmedCheckouts, setUnconfirmedCheckouts] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [
        locationStats,
        peopleStats,
        checkInStats,
        materialStats,
        allocationStats,
        followUpStats,
        replenishmentStats,
        lowStock,
        pending,
        unconfirmed,
      ] = await Promise.all([
        api.locations.getStatistics(),
        api.people.getStatistics(),
        api.checkIns.getStatistics(),
        api.materials.getStatistics(),
        api.allocations.getStatistics(),
        api.followUps.getStatistics(),
        api.replenishments.getStatistics(),
        api.materials.getLowStock(),
        api.followUps.getPending(),
        api.checkIns.getUnconfirmed(),
      ]);

      setStats({
        locations: locationStats,
        people: peopleStats,
        checkIns: checkInStats,
        materials: materialStats,
        allocations: allocationStats,
        followUps: followUpStats,
        replenishments: replenishmentStats,
      });
      setLowStockMaterials(lowStock);
      setPendingFollowUps(pending);
      setUnconfirmedCheckouts(unconfirmed);
    } catch (error) {
      console.error('加载统计数据失败', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>加载中...</div>;
  }

  const hasWarnings = lowStockMaterials.length > 0 || pendingFollowUps.length > 0 || unconfirmedCheckouts.length > 0;

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>数据概览</Title>
          <Text size="sm" c="dimmed">实时监控系统运行状态</Text>
        </div>
      </Group>

      {hasWarnings && (
        <Alert
          icon={<IconAlertTriangle size="1rem" />}
          title="需要关注"
          color="yellow"
          mb="xl"
        >
          <Group gap="lg">
            {lowStockMaterials.length > 0 && (
              <Text size="sm">
                <strong>{lowStockMaterials.length}</strong> 种物资库存不足
              </Text>
            )}
            {pendingFollowUps.length > 0 && (
              <Text size="sm">
                <strong>{pendingFollowUps.length}</strong> 条回访待处理
              </Text>
            )}
            {unconfirmedCheckouts.length > 0 && (
              <Text size="sm">
                <strong>{unconfirmedCheckouts.length}</strong> 人离站未确认
              </Text>
            )}
          </Group>
        </Alert>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
        <StatCard
          title="避暑点位"
          value={`${stats.locations?.open || 0}/${stats.locations?.total || 0}`}
          icon={<IconMapPin size="1.5rem" />}
          color="green"
          subtitle={`${stats.locations?.full || 0} 个已满员`}
        />
        <StatCard
          title="当前在站"
          value={stats.checkIns?.currentlyIn || 0}
          icon={<IconUsers size="1.5rem" />}
          color="blue"
          subtitle={`今日进站 ${stats.checkIns?.todayCheckIns || 0} 人`}
        />
        <StatCard
          title="物资库存"
          value={stats.materials?.totalQuantity || 0}
          icon={<IconPackage size="1.5rem" />}
          color="orange"
          subtitle={`${stats.materials?.lowStock || 0} 种低于安全线`}
        />
        <StatCard
          title="待处理事项"
          value={(stats.followUps?.pending || 0) + (stats.allocations?.pending || 0)}
          icon={<IconPhoneCall size="1.5rem" />}
          color="red"
          subtitle={`${stats.replenishments?.pending || 0} 补货单待审批`}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={5}>库存预警</Title>
            <StatusBadge status="high" />
          </Group>
          {lowStockMaterials.length === 0 ? (
            <Group>
              <IconCheck size="1.2rem" color="green" />
              <Text c="dimmed" size="sm">所有物资库存充足</Text>
            </Group>
          ) : (
            lowStockMaterials.slice(0, 5).map((material) => (
              <Group key={material.id} justify="space-between" py="xs" style={{ borderBottom: '1px solid #eee' }}>
                <div>
                  <Text size="sm" fw={500}>{material.name}</Text>
                  <Text size="xs" c="dimmed">安全线: {material.safetyStock} {material.unit}</Text>
                </div>
                <Text size="sm" fw={700} c="red">
                  {material.quantity} {material.unit}
                </Text>
              </Group>
            ))
          )}
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={5}>待回访人员</Title>
            <StatusBadge status="high" />
          </Group>
          {pendingFollowUps.length === 0 ? (
            <Group>
              <IconCheck size="1.2rem" color="green" />
              <Text c="dimmed" size="sm">暂无待回访</Text>
            </Group>
          ) : (
            pendingFollowUps.slice(0, 5).map((item) => (
              <Group key={item.id} justify="space-between" py="xs" style={{ borderBottom: '1px solid #eee' }}>
                <div>
                  <Text size="sm" fw={500}>{item.person?.name}</Text>
                  <Text size="xs" c="dimmed">{item.notes || '离站未确认'}</Text>
                </div>
                <StatusBadge status={item.status} />
              </Group>
            ))
          )}
        </Paper>
      </SimpleGrid>
    </div>
  );
}
