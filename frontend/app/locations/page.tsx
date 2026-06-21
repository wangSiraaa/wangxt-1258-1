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
  TextInput,
  NumberInput,
  Textarea,
  Select,
  Badge,
  Progress,
  ActionIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { IconPlus, IconEdit, IconTrash, IconMapPin } from '@tabler/icons-react';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { Location, LocationStatus } from '@/types';

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      address: '',
      street: '',
      community: '',
      capacity: 50,
      facilities: '',
      status: LocationStatus.OPEN,
    },
  });

  useEffect(() => {
    loadLocations();
  }, []);

  async function loadLocations() {
    try {
      const data = await api.locations.getAll();
      setLocations(data);
    } catch (error: any) {
      notifications.show({ title: '加载失败', message: error.message, color: 'red' });
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingLocation(null);
    form.reset();
    setModalOpen(true);
  }

  function openEditModal(location: Location) {
    setEditingLocation(location);
    form.setValues({
      name: location.name,
      address: location.address,
      street: location.street,
      community: location.community,
      capacity: location.capacity,
      facilities: location.facilities || '',
      status: location.status,
    });
    setModalOpen(true);
  }

  async function handleSubmit(values: any) {
    try {
      if (editingLocation) {
        await api.locations.update(editingLocation.id, values);
        notifications.show({ title: '成功', message: '点位已更新', color: 'green' });
      } else {
        await api.locations.create(values);
        notifications.show({ title: '成功', message: '点位已创建', color: 'green' });
      }
      setModalOpen(false);
      loadLocations();
    } catch (error: any) {
      notifications.show({ title: '操作失败', message: error.message, color: 'red' });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这个点位吗？')) return;
    try {
      await api.locations.delete(id);
      notifications.show({ title: '成功', message: '点位已删除', color: 'green' });
      loadLocations();
    } catch (error: any) {
      notifications.show({ title: '删除失败', message: error.message, color: 'red' });
    }
  }

  const occupancyRate = (loc: Location) => {
    return Math.round((loc.currentOccupancy / loc.capacity) * 100);
  };

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>点位管理</Title>
          <Text size="sm" c="dimmed">街道发布和管理避暑安置点位</Text>
        </div>
        <Button leftSection={<IconPlus size="1rem" />} onClick={openCreateModal}>
          新增点位
        </Button>
      </Group>

      <Paper withBorder radius="md">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>点位名称</Table.Th>
              <Table.Th>所属街道/社区</Table.Th>
              <Table.Th>地址</Table.Th>
              <Table.Th>容量</Table.Th>
              <Table.Th>状态</Table.Th>
              <Table.Th>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {locations.map((loc) => (
              <Table.Tr key={loc.id}>
                <Table.Td>
                  <Group>
                    <IconMapPin size="1rem" color="#1677ff" />
                    <Text fw={500}>{loc.name}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{loc.street}</Text>
                  <Text size="xs" c="dimmed">{loc.community}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{loc.address}</Text>
                </Table.Td>
                <Table.Td style={{ minWidth: 180 }}>
                  <Group justify="space-between" mb={4}>
                    <Text size="sm">
                      {loc.currentOccupancy} / {loc.capacity}
                    </Text>
                    <Badge color={occupancyRate(loc) >= 100 ? 'red' : occupancyRate(loc) >= 80 ? 'yellow' : 'green'}>
                      {occupancyRate(loc)}%
                    </Badge>
                  </Group>
                  <Progress
                    value={occupancyRate(loc)}
                    color={occupancyRate(loc) >= 100 ? 'red' : occupancyRate(loc) >= 80 ? 'yellow' : 'green'}
                    size="sm"
                  />
                </Table.Td>
                <Table.Td>
                  <StatusBadge status={loc.status} />
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon variant="subtle" color="blue" onClick={() => openEditModal(loc)}>
                      <IconEdit size="1rem" />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(loc.id)}>
                      <IconTrash size="1rem" />
                    </ActionIcon>
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
        title={editingLocation ? '编辑点位' : '新增点位'}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="点位名称"
            placeholder="请输入点位名称"
            {...form.getInputProps('name')}
            mb="md"
            required
          />
          <Group grow mb="md">
            <TextInput
              label="所属街道"
              placeholder="请输入街道名称"
              {...form.getInputProps('street')}
              required
            />
            <TextInput
              label="所属社区"
              placeholder="请输入社区名称"
              {...form.getInputProps('community')}
              required
            />
          </Group>
          <TextInput
            label="详细地址"
            placeholder="请输入详细地址"
            {...form.getInputProps('address')}
            mb="md"
            required
          />
          <Group grow mb="md">
            <NumberInput
              label="容纳人数"
              placeholder="请输入容纳人数"
              min={1}
              {...form.getInputProps('capacity')}
              required
            />
            <Select
              label="状态"
              data={[
                { value: LocationStatus.OPEN, label: '开放中' },
                { value: LocationStatus.FULL, label: '已满员' },
                { value: LocationStatus.CLOSED, label: '已关闭' },
              ]}
              {...form.getInputProps('status')}
            />
          </Group>
          <Textarea
            label="配套设施"
            placeholder="空调、饮水机、急救箱等"
            {...form.getInputProps('facilities')}
            mb="md"
          />
          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" onClick={() => setModalOpen(false)}>取消</Button>
            <Button type="submit">{editingLocation ? '保存修改' : '创建点位'}</Button>
          </Group>
        </form>
      </Modal>
    </div>
  );
}
