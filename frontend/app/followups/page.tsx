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
import { IconPhoneCall, IconEdit, IconAlertTriangle, IconUser, IconEye } from '@tabler/icons-react';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { FollowUp, FollowUpStatus, Person, ContactResult } from '@/types';

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>(FollowUpStatus.PENDING);
  const [filterType, setFilterType] = useState<string>('');

  const form = useForm({
    initialValues: {
      status: FollowUpStatus.PENDING,
      contactResult: '' as ContactResult | '',
      departureRemarks: '',
      notes: '',
      needsFurtherAction: false,
    },
  });

  useEffect(() => {
    loadData();
  }, [filterStatus, filterType]);

  async function loadData() {
    try {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      if (filterType === 'departure') params.isDepartureFollowUp = 'true';
      if (filterType === 'regular') params.isDepartureFollowUp = 'false';

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
      contactResult: followUp.contactResult || '',
      departureRemarks: followUp.departureRemarks || '',
      notes: followUp.notes || '',
      needsFurtherAction: followUp.needsFurtherAction,
    });
    setModalOpen(true);
  }

  async function handleSubmit(values: any) {
    if (!editingFollowUp) return;
    try {
      const submitData: any = {
        status: values.status,
        notes: values.notes,
        needsFurtherAction: values.needsFurtherAction,
      };
      if (values.contactResult) {
        submitData.contactResult = values.contactResult;
      }
      if (values.departureRemarks) {
        submitData.departureRemarks = values.departureRemarks;
      }
      await api.followUps.update(editingFollowUp.id, submitData);
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
  const departurePendingCount = followUps.filter(
    (f) => f.isDepartureFollowUp && f.status === FollowUpStatus.PENDING
  ).length;

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>回访提醒</Title>
          <Text size="sm" c="dimmed">对离站未确认人员进行电话回访</Text>
        </div>
        <Group>
          <Select
            placeholder="回访类型"
            clearable
            value={filterType}
            onChange={(value) => setFilterType(value || '')}
            data={[
              { value: 'departure', label: '仅离站回访' },
              { value: 'regular', label: '仅常规回访' },
            ]}
            style={{ width: 140 }}
          />
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
            {departurePendingCount > 0 && (
              <Text size="sm">
                其中离站回访 <strong>{departurePendingCount}</strong> 条
              </Text>
            )}
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
              <Table.Th>回访类型</Table.Th>
              <Table.Th>回访原因/备注</Table.Th>
              <Table.Th>联系结果</Table.Th>
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
                  {followUp.isDepartureFollowUp ? (
                    <Badge color="orange" size="sm">离站回访</Badge>
                  ) : (
                    <Badge color="blue" size="sm">常规回访</Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  {followUp.departureRemarks ? (
                    <div>
                      <Text size="sm" fw={500}>离站备注:</Text>
                      <Text size="sm" lineClamp={2}>{followUp.departureRemarks}</Text>
                    </div>
                  ) : (
                    <Text size="sm" lineClamp={2}>
                      {followUp.notes || (followUp.isDepartureFollowUp ? '离站未确认' : '-')}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  {followUp.contactResult ? (
                    <StatusBadge status={followUp.contactResult} />
                  ) : (
                    <Text size="sm" c="dimmed">-</Text>
                  )}
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
                        color={followUp.isDepartureFollowUp ? 'orange' : 'blue'}
                        leftSection={<IconPhoneCall size="0.8rem" />}
                        onClick={() => openEditModal(followUp)}
                      >
                        处理回访
                      </Button>
                    )}
                    {followUp.status !== FollowUpStatus.PENDING && (
                      <Group gap="xs">
                        <ActionIcon variant="subtle" color="blue" onClick={() => openEditModal(followUp)}>
                          <IconEdit size="1rem" />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="cyan"
                          onClick={() => {
                            setEditingFollowUp(followUp);
                            form.setValues({
                              status: followUp.status,
                              contactResult: followUp.contactResult || '',
                              departureRemarks: followUp.departureRemarks || '',
                              notes: followUp.notes || '',
                              needsFurtherAction: followUp.needsFurtherAction,
                            });
                            setModalOpen(true);
                          }}
                        >
                          <IconEye size="1rem" />
                        </ActionIcon>
                      </Group>
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
        title={editingFollowUp?.isDepartureFollowUp ? '处理离站回访' : '处理回访'}
        size="lg"
      >
        {editingFollowUp && (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Alert color="blue" mb="md">
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={500}>
                  回访人员: <strong>{editingFollowUp.person?.name}</strong>
                </Text>
                {editingFollowUp.isDepartureFollowUp && (
                  <Badge color="orange" size="sm">离站回访</Badge>
                )}
              </Group>
              <Text size="sm">
                联系电话: <strong>{editingFollowUp.person?.phone}</strong>
              </Text>
              {editingFollowUp.person?.emergencyContact && (
                <Text size="sm" c="dimmed">
                  紧急联系人: {editingFollowUp.person.emergencyContact}
                  ({editingFollowUp.person.emergencyPhone})
                </Text>
              )}
              {editingFollowUp.person?.medicalConditions && (
                <Text size="sm" c="dimmed">
                  健康状况: {editingFollowUp.person.medicalConditions}
                </Text>
              )}
              {editingFollowUp.checkInRecord && (
                <Text size="sm" c="dimmed" mt="xs">
                  离站点位: {editingFollowUp.checkInRecord.location?.name} |
                  离站时间: {editingFollowUp.checkInRecord.checkOutTime
                    ? new Date(editingFollowUp.checkInRecord.checkOutTime).toLocaleString('zh-CN')
                    : '-'}
                </Text>
              )}
            </Alert>

            <Select
              label="回访结果"
              data={[
                { value: FollowUpStatus.COMPLETED, label: '已完成回访' },
                { value: FollowUpStatus.NO_ANSWER, label: '电话未接听' },
                { value: FollowUpStatus.NEEDS_ASSISTANCE, label: '需要协助' },
                { value: FollowUpStatus.PENDING, label: '待处理' },
              ]}
              {...form.getInputProps('status')}
              mb="md"
              required
            />

            {editingFollowUp.isDepartureFollowUp && (
              <>
                <Select
                  label="离站联系结果"
                  data={[
                    { value: ContactResult.ARRIVED_SAFE, label: '已确认安全到家' },
                    { value: ContactResult.NOT_ARRIVED, label: '未到家，需进一步跟进' },
                    { value: ContactResult.NO_ANSWER, label: '电话未接听' },
                    { value: ContactResult.WRONG_NUMBER, label: '号码错误' },
                    { value: ContactResult.OTHER, label: '其他情况' },
                  ]}
                  {...form.getInputProps('contactResult')}
                  mb="md"
                  clearable
                  placeholder="请选择联系结果"
                />
                <Textarea
                  label="离站回访备注"
                  placeholder="请记录回访情况，如：已与本人通话确认安全到家、家人代接、途中转车、需社区派人接送等"
                  {...form.getInputProps('departureRemarks')}
                  mb="md"
                  minRows={3}
                />
              </>
            )}

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
