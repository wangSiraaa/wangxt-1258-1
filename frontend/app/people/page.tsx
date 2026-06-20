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
  Textarea,
  Select,
  ActionIcon,
  notifications,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconEdit, IconTrash, IconUser, IconPhone } from '@tabler/icons-react';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { Person, PersonPriority } from '@/types';

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('');

  const form = useForm({
    initialValues: {
      name: '',
      idCard: '',
      phone: '',
      address: '',
      community: '',
      priority: PersonPriority.MEDIUM,
      medicalConditions: '',
      emergencyContact: '',
      emergencyPhone: '',
    },
  });

  useEffect(() => {
    loadPeople();
  }, [filterPriority]);

  async function loadPeople() {
    try {
      const params = filterPriority ? { priority: filterPriority } : {};
      const data = await api.people.getAll(params);
      setPeople(data);
    } catch (error: any) {
      notifications.show({ title: '加载失败', message: error.message, color: 'red' });
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingPerson(null);
    form.reset();
    setModalOpen(true);
  }

  function openEditModal(person: Person) {
    setEditingPerson(person);
    form.setValues({
      name: person.name,
      idCard: person.idCard,
      phone: person.phone,
      address: person.address,
      community: person.community,
      priority: person.priority,
      medicalConditions: person.medicalConditions || '',
      emergencyContact: person.emergencyContact || '',
      emergencyPhone: person.emergencyPhone || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(values: any) {
    try {
      if (editingPerson) {
        await api.people.update(editingPerson.id, values);
        notifications.show({ title: '成功', message: '人员信息已更新', color: 'green' });
      } else {
        await api.people.create(values);
        notifications.show({ title: '成功', message: '人员已添加', color: 'green' });
      }
      setModalOpen(false);
      loadPeople();
    } catch (error: any) {
      notifications.show({ title: '操作失败', message: error.message, color: 'red' });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除该人员信息吗？')) return;
    try {
      await api.people.delete(id);
      notifications.show({ title: '成功', message: '人员已删除', color: 'green' });
      loadPeople();
    } catch (error: any) {
      notifications.show({ title: '删除失败', message: error.message, color: 'red' });
    }
  }

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>重点人群</Title>
          <Text size="sm" c="dimmed">社区登记和管理重点关注人群</Text>
        </div>
        <Group>
          <Select
            placeholder="筛选优先级"
            clearable
            value={filterPriority}
            onChange={(value) => setFilterPriority(value || '')}
            data={[
              { value: PersonPriority.HIGH, label: '高优先级' },
              { value: PersonPriority.MEDIUM, label: '中优先级' },
              { value: PersonPriority.LOW, label: '低优先级' },
            ]}
            style={{ width: 140 }}
          />
          <Button leftSection={<IconPlus size="1rem" />} onClick={openCreateModal}>
            新增人员
          </Button>
        </Group>
      </Group>

      <Paper withBorder radius="md">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>姓名</Table.Th>
              <Table.Th>联系方式</Table.Th>
              <Table.Th>社区/地址</Table.Th>
              <Table.Th>优先级</Table.Th>
              <Table.Th>健康状况</Table.Th>
              <Table.Th>状态</Table.Th>
              <Table.Th>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {people.map((person) => (
              <Table.Tr key={person.id}>
                <Table.Td>
                  <Group>
                    <IconUser size="1rem" color="#1677ff" />
                    <Text fw={500}>{person.name}</Text>
                  </Group>
                  <Text size="xs" c="dimmed">身份证: {person.idCard}</Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <IconPhone size="0.8rem" color="green" />
                    <Text size="sm">{person.phone}</Text>
                  </Group>
                  {person.emergencyContact && (
                    <Text size="xs" c="dimmed">
                      紧急联系人: {person.emergencyContact} ({person.emergencyPhone})
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{person.community}</Text>
                  <Text size="xs" c="dimmed">{person.address}</Text>
                </Table.Td>
                <Table.Td>
                  <StatusBadge status={person.priority} />
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{person.medicalConditions || '无特殊情况'}</Text>
                </Table.Td>
                <Table.Td>
                  {person.isCurrentlyCheckedIn ? (
                    <StatusBadge status="checked_in" />
                  ) : (
                    <StatusBadge status="checked_out" />
                  )}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon variant="subtle" color="blue" onClick={() => openEditModal(person)}>
                      <IconEdit size="1rem" />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(person.id)}>
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
        title={editingPerson ? '编辑人员' : '新增人员'}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Group grow mb="md">
            <TextInput
              label="姓名"
              placeholder="请输入姓名"
              {...form.getInputProps('name')}
              required
            />
            <TextInput
              label="身份证号"
              placeholder="请输入身份证号"
              {...form.getInputProps('idCard')}
              required
            />
          </Group>
          <Group grow mb="md">
            <TextInput
              label="联系电话"
              placeholder="请输入联系电话"
              {...form.getInputProps('phone')}
              required
            />
            <Select
              label="优先级"
              data={[
                { value: PersonPriority.HIGH, label: '高优先级（独居老人/慢性病患者）' },
                { value: PersonPriority.MEDIUM, label: '中优先级（普通老人/孕妇）' },
                { value: PersonPriority.LOW, label: '低优先级（普通居民）' },
              ]}
              {...form.getInputProps('priority')}
              required
            />
          </Group>
          <Group grow mb="md">
            <TextInput
              label="所属社区"
              placeholder="请输入社区名称"
              {...form.getInputProps('community')}
              required
            />
            <TextInput
              label="详细地址"
              placeholder="请输入详细地址"
              {...form.getInputProps('address')}
              required
            />
          </Group>
          <Textarea
            label="健康状况/慢性病"
            placeholder="高血压、糖尿病等需要特别关注的情况"
            {...form.getInputProps('medicalConditions')}
            mb="md"
          />
          <Group grow mb="md">
            <TextInput
              label="紧急联系人"
              placeholder="请输入紧急联系人姓名"
              {...form.getInputProps('emergencyContact')}
            />
            <TextInput
              label="紧急联系电话"
              placeholder="请输入紧急联系电话"
              {...form.getInputProps('emergencyPhone')}
            />
          </Group>
          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" onClick={() => setModalOpen(false)}>取消</Button>
            <Button type="submit">{editingPerson ? '保存修改' : '添加人员'}</Button>
          </Group>
        </form>
      </Modal>
    </div>
  );
}
