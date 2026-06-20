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
  ActionIcon,
  Progress,
  notifications,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconEdit, IconAlertTriangle, IconPackage } from '@tabler/icons-react';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { Material, MaterialCategory } from '@/types';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      category: MaterialCategory.OTHER,
      unit: '箱',
      quantity: 0,
      safetyStock: 20,
      specifications: '',
      storageLocation: '',
    },
  });

  useEffect(() => {
    loadMaterials();
  }, [filterCategory, showLowStockOnly]);

  async function loadMaterials() {
    try {
      let data = await api.materials.getAll();
      if (filterCategory) {
        data = data.filter((m: Material) => m.category === filterCategory);
      }
      if (showLowStockOnly) {
        data = data.filter((m: Material) => m.lowStockAlert);
      }
      setMaterials(data);
    } catch (error: any) {
      notifications.show({ title: '加载失败', message: error.message, color: 'red' });
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingMaterial(null);
    form.reset();
    setModalOpen(true);
  }

  function openEditModal(material: Material) {
    setEditingMaterial(material);
    form.setValues({
      name: material.name,
      category: material.category,
      unit: material.unit,
      quantity: material.quantity,
      safetyStock: material.safetyStock,
      specifications: material.specifications || '',
      storageLocation: material.storageLocation || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(values: any) {
    try {
      if (editingMaterial) {
        await api.materials.update(editingMaterial.id, values);
        notifications.show({ title: '成功', message: '物资信息已更新', color: 'green' });
      } else {
        await api.materials.create(values);
        notifications.show({ title: '成功', message: '物资已添加', color: 'green' });
      }
      setModalOpen(false);
      loadMaterials();
    } catch (error: any) {
      notifications.show({ title: '操作失败', message: error.message, color: 'red' });
    }
  }

  async function handleCheckReplenishments() {
    try {
      await api.materials.checkReplenishments();
      notifications.show({ title: '成功', message: '库存检查完成，已自动生成补货单', color: 'green' });
      loadMaterials();
    } catch (error: any) {
      notifications.show({ title: '操作失败', message: error.message, color: 'red' });
    }
  }

  const stockRate = (m: Material) => {
    if (m.safetyStock === 0) return 100;
    return Math.min(Math.round((m.quantity / (m.safetyStock * 2)) * 100), 100);
  };

  const lowStockCount = materials.filter((m) => m.lowStockAlert).length;

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>物资管理</Title>
          <Text size="sm" c="dimmed">仓库管理饮用水、药品等物资库存</Text>
        </div>
        <Group>
          <Select
            placeholder="物资分类"
            clearable
            value={filterCategory}
            onChange={(value) => setFilterCategory(value || '')}
            data={[
              { value: MaterialCategory.DRINKING_WATER, label: '饮用水' },
              { value: MaterialCategory.MEDICINE, label: '药品' },
              { value: MaterialCategory.FOOD, label: '食品' },
              { value: MaterialCategory.OTHER, label: '其他' },
            ]}
            style={{ width: 120 }}
          />
          <Button
            variant={showLowStockOnly ? 'filled' : 'light'}
            color="red"
            leftSection={<IconAlertTriangle size="1rem" />}
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          >
            库存预警 ({lowStockCount})
          </Button>
          <Button variant="light" onClick={handleCheckReplenishments}>
            检查库存
          </Button>
          <Button leftSection={<IconPlus size="1rem" />} onClick={openCreateModal}>
            新增物资
          </Button>
        </Group>
      </Group>

      <Paper withBorder radius="md">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>物资名称</Table.Th>
              <Table.Th>分类</Table.Th>
              <Table.Th>库存</Table.Th>
              <Table.Th>安全线</Table.Th>
              <Table.Th>库存状态</Table.Th>
              <Table.Th>存放位置</Table.Th>
              <Table.Th>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {materials.map((material) => (
              <Table.Tr key={material.id} bg={material.lowStockAlert ? '#fff7e6' : undefined}>
                <Table.Td>
                  <Group>
                    <IconPackage size="1rem" color="#1677ff" />
                    <Text fw={500}>{material.name}</Text>
                    {material.lowStockAlert && (
                      <Badge color="red" size="xs">库存不足</Badge>
                    )}
                  </Group>
                  {material.specifications && (
                    <Text size="xs" c="dimmed">{material.specifications}</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <StatusBadge status={material.category} />
                </Table.Td>
                <Table.Td>
                  <Text fw={700}>{material.quantity} {material.unit}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{material.safetyStock} {material.unit}</Text>
                </Table.Td>
                <Table.Td style={{ minWidth: 180 }}>
                  <Group justify="space-between" mb={4}>
                    <Text size="xs">库存水平</Text>
                    <Text size="xs" fw={500} c={stockRate(material) < 50 ? 'red' : 'green'}>
                      {stockRate(material)}%
                    </Text>
                  </Group>
                  <Progress
                    value={stockRate(material)}
                    color={stockRate(material) < 50 ? 'red' : stockRate(material) < 80 ? 'yellow' : 'green'}
                    size="sm"
                  />
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{material.storageLocation || '-'}</Text>
                </Table.Td>
                <Table.Td>
                  <ActionIcon variant="subtle" color="blue" onClick={() => openEditModal(material)}>
                    <IconEdit size="1rem" />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMaterial ? '编辑物资' : '新增物资'}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Group grow mb="md">
            <TextInput
              label="物资名称"
              placeholder="请输入物资名称"
              {...form.getInputProps('name')}
              required
            />
            <Select
              label="分类"
              data={[
                { value: MaterialCategory.DRINKING_WATER, label: '饮用水' },
                { value: MaterialCategory.MEDICINE, label: '药品' },
                { value: MaterialCategory.FOOD, label: '食品' },
                { value: MaterialCategory.OTHER, label: '其他' },
              ]}
              {...form.getInputProps('category')}
              required
            />
          </Group>
          <Group grow mb="md">
            <TextInput
              label="单位"
              placeholder="箱、瓶、盒等"
              {...form.getInputProps('unit')}
              required
            />
            <NumberInput
              label="当前库存"
              placeholder="请输入当前库存数量"
              min={0}
              {...form.getInputProps('quantity')}
              required
            />
            <NumberInput
              label="安全库存"
              placeholder="低于此数量自动预警"
              min={0}
              {...form.getInputProps('safetyStock')}
              required
            />
          </Group>
          <TextInput
            label="规格型号"
            placeholder="如：550ml/瓶、0.5g/片等"
            {...form.getInputProps('specifications')}
            mb="md"
          />
          <TextInput
            label="存放位置"
            placeholder="A区-1号货架"
            {...form.getInputProps('storageLocation')}
            mb="md"
          />
          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" onClick={() => setModalOpen(false)}>取消</Button>
            <Button type="submit">{editingMaterial ? '保存修改' : '添加物资'}</Button>
          </Group>
        </form>
      </Modal>
    </div>
  );
}
