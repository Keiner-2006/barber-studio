import { IReportsRepository, ReportFilters, ISalesReport, IOccupancyReport, IServiceReport, IInventoryReport, ICashReport } from '../../application/ports/IReportsRepository'
import { reportRepository } from '../repositories/report.repository'

export class DrizzleReportsAdapter implements IReportsRepository {
  async getSales(filters: ReportFilters): Promise<ISalesReport[]> {
    return reportRepository.getSales({
      from: filters.from?.toISOString(),
      to: filters.to?.toISOString(),
      branchId: filters.branchId,
    })
  }

  async getOccupancy(filters: ReportFilters): Promise<IOccupancyReport[]> {
    return reportRepository.getOccupancy({
      from: filters.from?.toISOString(),
      to: filters.to?.toISOString(),
      branchId: filters.branchId,
    })
  }

  async getServices(filters: ReportFilters): Promise<IServiceReport[]> {
    return reportRepository.getServices({
      from: filters.from?.toISOString(),
      to: filters.to?.toISOString(),
      branchId: filters.branchId,
    })
  }

  async getInventory(branchId?: string): Promise<IInventoryReport[]> {
    return reportRepository.getInventory({ branchId })
  }

  async getCash(filters: ReportFilters): Promise<ICashReport[]> {
    return reportRepository.getCash({
      from: filters.from?.toISOString(),
      to: filters.to?.toISOString(),
      branchId: filters.branchId,
    })
  }
}