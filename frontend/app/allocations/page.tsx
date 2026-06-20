'use client';

import { useEffect, useState } from 'react';
import {
  Group,
  Title,
  Text,
  Button,
  Table,
  Paper,
  Modal,
  Select,
  NumberInput,
  Textarea,
  ActionIcon,
  notifications,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconCheck, IconTruck } from '@tabler/icons-react';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { Allocation, Material, Location, AllocationStatus } from '@/types';

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const form = useForm({
    initialValues: {
      materialId: '',
      fromLocation: '中心仓库',
      toLocationId: '',
      quantity: 10,
      remarks: '',
    },
  });

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  async function loadData() {
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const [allocationsData, materialsData, locationsData] = await Promise.all([
        api.allocations.getAll(params),
        api.materials.getAll(),
        api.locations.getAll({ status: 'open' }),
      ]);
      setAllocations(allocationsData);
      setMaterials(materialsData);
      setLocations(locationsData);
    } catch (error: any) {
      notifications.show({ title: '加载失败', message: error.message, color: 'red' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(values: any) {
    try {
      await api.allocations.create(values);
      notifications.show({ title: '成功', message: '调拨单已创建', color: 'green' });
      setModalOpen(false);
      form.reset();
      loadData();
    } catch (error: any) {
      notifications.show({ title: '创建失败', message: error.message, color: 'red' });
    }
  }

  async function handleConfirmDelivery(id: string) {
    if (!confirm('确认物资已送达？')) return;
    try {
      await api.allocations.confirmDelivery(id);
      notifications.show({ title: '成功', message: '已确认收货', color: 'green' });
      loadData();
    } catch (error: any) {
      notifications.show({ title: '操作失败', message: error.message, color: 'red' });
    }
  }

  async function handleUpdateStatus(id: string, status: AllocationStatus) {
    try {
      await api.allocations.update(id, { status });
      notifications.show({ title: '成功', message: '状态已更新', color: 'green' });
      loadData();
    } catch (error: any) {
      notifications.show({ title: '操作失败', message: error.message, color: 'red' });
    }
  }

  const availableMaterials = materials.filter((m) => m.quantity > 0);

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>物资调拨</Title>
          <Text size="sm" c="dimmed">仓库向点位调拨饮用水和药品等物资</Text>
        </div>
        <Group>
          <Select
            placeholder="筛选状态"
            clearable
            value={filterStatus}
            onChange={(value) => setFilterStatus(value || '')}
            data={[
              { value: AllocationStatus.PENDING, label: '待出库' },
              { value: AllocationStatus.IN_TRANSIT, label: '运输中' },
              { value: AllocationStatus.DELIVERED, label: '已送达' },
            ]}
            style={{ width: 120 }}
          />
          <Button leftSection={<IconPlus size="1rem" />} onClick={() => setModalOpen(true)}>
            新建调拨
          </Button>
        </Group>
      </Group>

      <Paper withBorder radius="md">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>物资</Table.Th>
              <Table.Th>数量</Table.Th>
              <Table.Th>目的地</Table.Th>
              <Table.Th>状态</Table.Th>
              <Table.Th>创建时间</Table.Th>
              <Table.Th>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {allocations.map((alloc) => (
              <Table.Tr key={alloc.id}>
                <Table.Td>
                  <Group>
                    <IconTruck size="1rem" color="#1677ff" />
                    <Text fw={500}>{alloc.material?.name}</Text>
                  </Group>
                  <StatusBadge status={alloc.material?.category || 'other'} />
                </Table.Td>
                <Table.Td>
                  <Text fw={700}>{alloc.quantity} {alloc.material?.unit}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{alloc.toLocation?.name}</Text>
                  <Text size="xs" c="dimmed">{alloc.toLocation?.address}</Text>
                </Table.Td>
                <Table.Td>
                  <StatusBadge status={alloc.status} />
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{new Date(alloc.createdAt).toLocaleString('zh-CN')}</Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {alloc.status === AllocationStatus.PENDING && (
                      <Button
                        size="xs"
                        variant="light"
                        color="blue"
                        onClick={() => handleUpdateStatus(alloc.id, AllocationStatus.IN_TRANSIT)}
                      >
                        出库
                      </Button>
                    )}
                    {alloc.status === AllocationStatus.IN_TRANSIT && (
                      <Button
                        size="xs"
                        variant="light"
                        color="green"
                        leftSection={<IconCheck size="0.8rem" />}
                        onClick={() => handleConfirmDelivery(alloc.id)}
                      >
                        确认收货
                      </Button>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="新建调拨单"
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Select
            label="选择物资"
            placeholder="请选择要调拨的物资"
            data={availableMaterials.map((m) => ({
              value: m.id,
              label: `${m.name} (库存: ${m.quantity} ${m.unit})`,
            }))}
            {...form.getInputProps('materialId')}
            mb="md"
            required
            searchable
          />
          <Group grow mb="md">
            <Textarea
              label="调出地点"
              {...form.getInputProps('fromLocation')}
              required
            />
            <Select
              label="调入点位"
              placeholder="请选择目的地点位"
              data={locations.map((l) => ({
                value: l.id,
                label: l.name,
              }))}
              {...form.getInputProps('toLocationId')}
              required
              searchable
            />
          </Group>
          <NumberInput
            label="调拨数量"
            placeholder="请输入调拨数量"
            min={1}
            {...form.getInputProps('quantity')}
            mb="md"
            required
          />
          <Textarea
            label="备注"
            placeholder="特殊说明"
            {...form.getInputProps('remarks')}
            mb="md"
          />
          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" onClick={() => setModalOpen(false)}>取消</Button>
            <Button type="submit">创建调拨单</Button>
          </Group>
        </form>
      </Modal>
    </div>
  );
}
