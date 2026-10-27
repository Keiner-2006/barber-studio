export interface Client {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  tradeName: string;
  businessType: 'barberia' | 'peluqueria' | 'grooming' | 'otro';
  countryCode: string;
  status: 'active' | 'provisioning' | 'suspended';
  createdAt: string;
}
