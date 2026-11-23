import type { Request, Response } from 'express';
import * as complaintService from '../services/complaint.service';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';

export async function createComplaint(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const complaint = await complaintService.createComplaint(req.user.id, req.body);
  sendSuccess(res, complaint, 201);
}

export async function getMyComplaints(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const complaints = await complaintService.getUserComplaints(req.user.id);
  sendSuccess(res, complaints);
}

export async function getComplaint(req: Request, res: Response) {
  if (!req.user?.id || !req.user?.role) throw ApiError.unauthorized('Authentication required');
  const complaint = await complaintService.getComplaintById(
    req.user.id,
    req.user.role,
    req.params.id as string,
  );
  sendSuccess(res, complaint);
}
