import axios from 'axios';
import { API_URL } from '../config';

export const membershipApi = {
  getMembershipTypes: () => axios.get(`${API_URL}/membership-types`),
  
  getUserMembership: () => axios.get(`${API_URL}/memberships/user`),
  
  createMembershipType: (membershipData: any) =>
    axios.post(`${API_URL}/membership-types`, membershipData),
  
  updateMembershipType: (id: string, data: any) =>
    axios.put(`${API_URL}/membership-types/${id}`, data),
  
  deleteMembershipType: (id: string) =>
    axios.delete(`${API_URL}/membership-types/${id}`),
  
  purchaseMembership: (membershipTypeId: string) =>
    axios.post(`${API_URL}/memberships`, { membershipTypeId }),
  
  cancelMembership: (membershipId: string) =>
    axios.delete(`${API_URL}/memberships/${membershipId}`),
};
