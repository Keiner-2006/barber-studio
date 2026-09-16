import { DrizzleAppointmentAdapter } from '../../modules/appointments/infrastructure/adapters/DrizzleAppointmentAdapter'
import { DrizzleBranchAdapter } from '../../modules/branches/infrastructure/adapters/DrizzleBranchAdapter'
import { DrizzleCatalogAdapter } from '../../modules/catalog/infrastructure/adapters/DrizzleCatalogAdapter'
import { DrizzleCustomerAdapter } from '../../modules/customers/infrastructure/adapters/DrizzleCustomerAdapter'
import { DrizzleInventoryAdapter } from '../../modules/inventory/infrastructure/adapters/DrizzleInventoryAdapter'
import { DrizzleCashAdapter } from '../../modules/cash/infrastructure/adapters/DrizzleCashAdapter'
import { DrizzlePurchasingAdapter } from '../../modules/purchasing/infrastructure/adapters/DrizzlePurchasingAdapter'
import { DrizzleReportsAdapter } from '../../modules/reports/infrastructure/adapters/DrizzleReportsAdapter'
import { GetAppointmentsUseCase } from '../../modules/appointments/application/use-cases/GetAppointments'
import { CreateAppointmentUseCase } from '../../modules/appointments/application/use-cases/CreateAppointment'
import { UpdateAppointmentUseCase } from '../../modules/appointments/application/use-cases/UpdateAppointment'
import { GetBranchesUseCase } from '../../modules/branches/application/use-cases/GetBranches'
import { ListServicesUseCase } from '../../modules/catalog/application/use-cases/ListServices'
import { SearchCustomersUseCase } from '../../modules/customers/application/use-cases/SearchCustomers'
import { ListProductsUseCase } from '../../modules/inventory/application/use-cases/ListProducts'
import { AddTransactionUseCase } from '../../modules/cash/application/use-cases/AddTransaction'

export const ServiceRegistry = {
  // Adapters
  appointmentAdapter: new DrizzleAppointmentAdapter(),
  branchAdapter: new DrizzleBranchAdapter(),
  catalogAdapter: new DrizzleCatalogAdapter(),
  customerAdapter: new DrizzleCustomerAdapter(),
  inventoryAdapter: new DrizzleInventoryAdapter(),
  cashAdapter: new DrizzleCashAdapter(),
  purchasingAdapter: new DrizzlePurchasingAdapter(),
  reportsAdapter: new DrizzleReportsAdapter(),

  // Use Cases
  appointments: {
    list: new GetAppointmentsUseCase(new DrizzleAppointmentAdapter()),
    create: new CreateAppointmentUseCase(new DrizzleAppointmentAdapter()),
    update: new UpdateAppointmentUseCase(new DrizzleAppointmentAdapter()),
  },
  branches: {
    list: new GetBranchesUseCase(new DrizzleBranchAdapter()),
  },
  catalog: {
    listServices: new ListServicesUseCase(new DrizzleCatalogAdapter()),
  },
  customers: {
    search: new SearchCustomersUseCase(new DrizzleCustomerAdapter()),
  },
  inventory: {
    listProducts: new ListProductsUseCase(new DrizzleInventoryAdapter()),
  },
  cash: {
    addTransaction: new AddTransactionUseCase(new DrizzleCashAdapter()),
  },
}

export type ServiceRegistry = typeof ServiceRegistry