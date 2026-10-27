export class Branch {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly name: string,
    public readonly address: string | null,
    public readonly phone: string | null,
    public readonly timezone: string,
    public readonly currency: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  toPlain() {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      address: this.address,
      phone: this.phone,
      timezone: this.timezone,
      currency: this.currency,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}