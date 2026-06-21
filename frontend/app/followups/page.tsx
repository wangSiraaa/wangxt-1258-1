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
  Textarea,
  Switch,
  ActionIcon,
  Badge,
  Alert,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { IconPhoneCall, IconEdit, IconAlertTriangle, IconUser } from '@tabler/icons-react';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { FollowUp, FollowUpStatus, Person } from '@/types';

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>(FollowUpStatus.PENDING);

  const form = useForm({
    initialValues: {
      status: FollowUpStatus.PENDING,
      notes: '',
      needsFurtherAction: false,
    },
  });

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  async function loadData() {
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const [followUpsData, peopleData] = await Promise.all([
        api.followUps.getAll(params),
        api.people.getAll(),
      ]);
      setFollowUps(followUpsData);
      setPeople(peopleData);
    } catch (error: any) {
      notifications.show({ title: '加载失败', message: error.message, color: 'red' });
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(followUp: FollowUp) {
    setEditingFollowUp(followUp);
    form.setValues({
      status: followUp.status,
      notes: followUp.notes || '',
      needsFurtherAction: followUp.needsFurtherAction,
    });
    setModalOpen(true);
  }

  async function handleSubmit(values: any) {
    if (!editingFollowUp) return;
    try {
      await api.followUps.update(editingFollowUp.id, values);
      notifications.show({ title: '成功', message: '回访记录已更新', color: 'green' });
      setModalOpen(false);
      loadData();
    } catch (error: any) {
      notifications.show({ title: '操作失败', message: error.message, color: 'red' });
    }
  }

  async function handleCreateFollowUp(personId: string) {
    try {
      await api.followUps.create({ personId });
      notifications.show({ title: '成功', message: '回访任务已创建', color: 'green' });
      loadData();
    } catch (error: any) {
      notifications.show({ title: '创建失败', message: error.message, color: 'red' });
    }
  }

  const pendingCount = followUps.filter((f) => f.status === FollowUpStatus.PENDING).length;
  const needsAssistanceCount = followUps.filter((f) => f.needsFurtherAction).length;

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>回访提醒</Title>
          <Text size="sm" c="dimmed">对离站未确认人员进行电话回访</Text>
        </div>
        <Group>
          <Select
            placeholder="筛选状态"
            value={filterStatus}
            onChange={(value) => setFilterStatus(value || '')}
            data={[
              { value: FollowUpStatus.PENDING, label: '待回访' },
              { value: FollowUpStatus.COMPLETED, label: '已完成' },
              { value: FollowUpStatus.NO_ANSWER, label: '未接听' },
              { value: FollowUpStatus.NEEDS_ASSISTANCE, label: '需协助' },
            ]}
            style={{ width: 140 }}
          />
        </Group>
      </Group>

      {pendingCount > 0 && (
        <Alert
          icon={<IconAlertTriangle size="1rem" />}
          title="待处理回访"
          color="yellow"
          mb="xl"
        >
          <Group gap="lg">
            <Text size="sm">
              有 <strong>{pendingCount}</strong> 条回访待处理，请及时联系
            </Text>
            {needsAssistanceCount > 0 && (
              <Text size="sm">
                <strong>{needsAssistanceCount}</strong> 人需要进一步协助
              </Text>
            )}
          </Group>
        </Alert>
      )}

      <Paper withBorder radius="md">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>人员信息</Table.Th>
              <Table.Th>联系方式</Table.Th>
              <Table.Th>回访原因</Table.Th>
              <Table.Th>状态</Table.Th>
              <Table.Th>创建时间</Table.Th>
              <Table.Th>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {followUps.map((followUp) => (
              <Table.Tr key={followUp.id} bg={followUp.needsFurtherAction ? '#fff1f0' : undefined}>
                <Table.Td>
                  <Group>
                    <IconUser size="1rem" color="#1677ff" />
                    <Text fw={500}>{followUp.person?.name}</Text>
                    <StatusBadge status={followUp.person?.priority || 'medium'} />
                  </Group>
                  <Text size="xs" c="dimmed">{followUp.person?.address}</Text>
                  {followUp.needsFurtherAction && (
                    <Badge color="red" size="xs" mt={4}>需进一步协助</Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{followUp.person?.phone}</Text>
                  {followUp.person?.emergencyContact && (
                    <Text size="xs" c="dimmed">
                      紧急: {followUp.person.emergencyContact} ({followUp.person.emergencyPhone})
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{followUp.notes || '离站未确认'}</Text>
                </Table.Td>
                <Table.Td>
                  <StatusBadge status={followUp.status} />
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{new Date(followUp.createdAt).toLocaleString('zh-CN')}</Text>
                  {followUp.followUpTime && (
                    <Text size="xs" c="dimmed">
                      处理: {new Date(followUp.followUpTime).toLocaleString('zh-CN')}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {followUp.status === FollowUpStatus.PENDING && (
                      <Button
                        size="xs"
                        variant="light"
                        color="blue"
                        leftSection={<IconPhoneCall size="0.8rem" />}
                        onClick={() => openEditModal(followUp)}
                      >
                        处理回访
                      </Button>
                    )}
                    {followUp.status !== FollowUpStatus.PENDING && (
                      <ActionIcon variant="subtle" color="blue" onClick={() => openEditModal(followUp)}>
                        <IconEdit size="1rem" />
                      </ActionIcon>
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
        title="处理回访"
        size="lg"
      >
        {editingFollowUp && (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Alert color="blue" mb="md">
              <Text size="sm">
                回访人员: <strong>{editingFollowUp.person?.name}</strong>
              </Text>
              <Text size="sm">
                联系电话: <strong>{editingFollowUp.person?.phone}</strong>
              </Text>
              {editingFollowUp.person?.medicalConditions && (
                <Text size="sm" c="dimmed">
                  健康状况: {editingFollowUp.person.medicalConditions}
                </Text>
              )}
            </Alert>
            <Select
              label="回访结果"
              data={[
                { value: FollowUpStatus.COMPLETED, label: '已确认安全到家' },
                { value: FollowUpStatus.NO_ANSWER, label: '电话未接听' },
                { value: FollowUpStatus.NEEDS_ASSISTANCE, label: '需要协助' },
              ]}
              {...form.getInputProps('status')}
              mb="md"
              required
            />
            <Group justify="space-between" mb="md">
              <Text size="sm">需要进一步协助处理</Text>
              <Switch
                {...form.getInputProps('needsFurtherAction')}
                labelPosition="left"
              />
            </Group>
            <Textarea
              label="回访记录"
              placeholder="请记录回访情况和人员状态"
              {...form.getInputProps('notes')}
              mb="md"
              required
              minRows={3}
            />
            <Group justify="flex-end" mt="xl">
              <Button variant="subtle" onClick={() => setModalOpen(false)}>取消</Button>
              <Button type="submit">保存回访结果</Button>
            </Group>
          </form>
        )}
      </Modal>
    </div>
  );
}
