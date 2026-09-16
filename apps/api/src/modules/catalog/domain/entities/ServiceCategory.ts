export interface ServiceCategoryProps {
  id: string
  tenantId: string
  name: string
  description: string | null
  displayOrder: number
  active: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export class ServiceCategory {
  constructor(private readonly props: ServiceCategoryProps) {}

  get id() { return this.props.id }
  get tenantId() { return this.props.tenantId }
  get name() { return this.props.name }
  get description() { return this.props.description }
  get displayOrder() { return this.props.displayOrder }
  get active() { return this.props.active }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }
  get deletedAt() { return this.props.deletedAt }

  isActive(): boolean {
    return this.props.active && this.props.deletedAt === null
  }

  toPlain(): ServiceCategoryProps {
    return { ...this.props }
  }

  static fromPlain(props: ServiceCategoryProps): ServiceCategory {
    return new ServiceCategory(props)
  }
}