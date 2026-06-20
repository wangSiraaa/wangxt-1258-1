import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MaterialService } from '../material/material.service';
import { CheckInService } from '../checkin/checkin.service';
import { FollowUpService } from '../follow-up/follow-up.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private materialService: MaterialService,
    private checkInService: CheckInService,
    private followUpService: FollowUpService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkMaterialStock() {
    this.logger.log('开始检查物资库存...');
    try {
      await this.materialService.checkAndGenerateReplenishments();
      this.logger.log('物资库存检查完成');
    } catch (error) {
      this.logger.error('物资库存检查失败', error);
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async checkUnconfirmedCheckOuts() {
    this.logger.log('开始检查未确认离站记录...');
    try {
      const unconfirmed = await this.checkInService.getUnconfirmedCheckOuts();
      this.logger.log(`发现 ${unconfirmed.length} 条未确认离站记录`);

      for (const record of unconfirmed) {
        if (!record.followUpReminderSent) {
          this.logger.warn(
            `人员 ${record.person?.name} 离站未确认，需要回访 (登记ID: ${record.id})`,
          );
          await this.checkInService.markReminderSent(record.id);
        }
      }
    } catch (error) {
      this.logger.error('未确认离站检查失败', error);
    }
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async checkPendingFollowUps() {
    this.logger.log('开始检查待处理回访...');
    try {
      const pending = await this.followUpService.getPendingFollowUps();
      this.logger.log(`发现 ${pending.length} 条待处理回访`);

      for (const followUp of pending) {
        const hoursSinceCreation =
          (Date.now() - new Date(followUp.createdAt).getTime()) / (1000 * 60 * 60);

        if (hoursSinceCreation > 2) {
          this.logger.warn(
            `回访任务超时未处理: 人员 ${followUp.person?.name}, 已等待 ${hoursSinceCreation.toFixed(1)} 小时`,
          );
        }
      }
    } catch (error) {
      this.logger.error('待处理回访检查失败', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async dailySummary() {
    this.logger.log('生成每日汇总...');
    try {
      const [checkInStats, materialStats, locationStats, followUpStats] = await Promise.all([
        this.checkInService.getStatistics(),
        this.materialService.getStatistics(),
        this.materialService.getLowStockMaterials(),
        this.followUpService.getStatistics(),
      ]);

      this.logger.log(`每日汇总:
        - 今日进站: ${checkInStats.todayCheckIns}
        - 今日出站: ${checkInStats.todayCheckOuts}
        - 当前在站: ${checkInStats.currentlyIn}
        - 物资库存告警: ${materialStats.lowStock} 种
        - 待回访: ${followUpStats.pending} 人
        - 低库存物资: ${locationStats.map((m) => `${m.name}(${m.quantity})`).join(', ')}
      `);
    } catch (error) {
      this.logger.error('每日汇总生成失败', error);
    }
  }
}
