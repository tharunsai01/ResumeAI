import type { Request, Response } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import * as adminService from '../services/admin.service';

export async function getAdminStats(_req: Request, res: Response) {
  const stats = await adminService.getAdminStats();
  sendSuccess(res, stats);
}

export async function getAdminUsers(req: Request, res: Response) {
  const result = await adminService.getAdminUsers({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    role: req.query.role as string | undefined,
    status: req.query.status as string | undefined,
    search: req.query.search as string | undefined,
  });
  sendSuccess(res, result);
}

export async function getAdminUserById(req: Request, res: Response) {
  const result = await adminService.getAdminUserById(req.params.id as string);
  sendSuccess(res, result);
}

export async function updateAdminUserStatus(req: Request, res: Response) {
  const result = await adminService.updateAdminUserStatus(req.params.id as string, req.body.status);
  sendSuccess(res, result);
}

export async function getAdminJobs(req: Request, res: Response) {
  const result = await adminService.getAdminJobs({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    status: req.query.status as string | undefined,
    search: req.query.search as string | undefined,
  });
  sendSuccess(res, result);
}

export async function updateAdminJobStatus(req: Request, res: Response) {
  const result = await adminService.updateAdminJobStatus(req.params.id as string, req.body.status);
  sendSuccess(res, result);
}
