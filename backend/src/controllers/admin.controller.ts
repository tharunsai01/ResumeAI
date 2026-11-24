import type { Request, Response } from 'express';
import * as adminService from '../services/admin.service';
import * as complaintService from '../services/complaint.service';
import * as skillService from '../services/skill.service';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';

export async function getAdminStats(_req: Request, res: Response) {
  const stats = await adminService.getAdminStats();
  sendSuccess(res, stats);
}

export async function getAdminUsers(req: Request, res: Response) {
  const users = await adminService.getAdminUsers(req.query as any);
  sendSuccess(res, users);
}

export async function getAdminUserById(req: Request, res: Response) {
  const data = await adminService.getAdminUserById(req.params.id as string);
  sendSuccess(res, data);
}

export async function updateAdminUserStatus(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const user = await adminService.updateAdminUserStatus(
    req.user.id,
    req.params.id as string,
    req.body.status as string,
  );
  sendSuccess(res, user);
}

export async function getAdminJobs(req: Request, res: Response) {
  const jobs = await adminService.getAdminJobs(req.query as any);
  sendSuccess(res, jobs);
}

export async function updateAdminJobStatus(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const job = await adminService.updateAdminJobStatus(
    req.user.id,
    req.params.id as string,
    req.body.status as string,
  );
  sendSuccess(res, job);
}

// Complaint management
export async function getComplaints(req: Request, res: Response) {
  const complaints = await complaintService.listComplaintsForAdmin(req.query as any);
  sendSuccess(res, complaints);
}

export async function getComplaintById(req: Request, res: Response) {
  if (!req.user?.id || !req.user?.role) throw ApiError.unauthorized('Authentication required');
  const complaint = await complaintService.getComplaintById(
    req.user.id,
    req.user.role,
    req.params.id as string,
  );
  sendSuccess(res, complaint);
}

export async function updateComplaint(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const updated = await complaintService.updateComplaintStatus(
    req.user.id,
    req.params.id as string,
    req.body,
  );
  sendSuccess(res, updated);
}

// Skill taxonomy & unknown skill review
export async function getSkills(req: Request, res: Response) {
  const skills = await skillService.listSkillsForAdmin(req.query as any);
  sendSuccess(res, skills);
}

export async function addSkill(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const skill = await skillService.addSkill(req.user.id, req.body);
  sendSuccess(res, skill, 201);
}

export async function updateSkill(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const skill = await skillService.updateSkill(req.user.id, req.params.id as string, req.body);
  sendSuccess(res, skill);
}

export async function reviewUnknownSkill(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const skill = await skillService.reviewUnknownSkill(
    req.user.id,
    req.params.id as string,
    req.body,
  );
  sendSuccess(res, skill);
}

export async function deleteSkill(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const result = await skillService.deleteSkill(req.user.id, req.params.id as string);
  sendSuccess(res, result);
}

// Audit logs
export async function getAuditLogs(req: Request, res: Response) {
  const logs = await adminService.getAuditLogs(req.query as any);
  sendSuccess(res, logs);
}

// AI Evaluation
export async function getAiEvaluations(_req: Request, res: Response) {
  const evaluations = await adminService.getAiEvaluations();
  sendSuccess(res, evaluations);
}

export async function runAiEvaluation(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const evaluation = await adminService.runAiEvaluation(req.user.id);
  sendSuccess(res, evaluation, 201);
}

// System Health
export async function getSystemHealth(_req: Request, res: Response) {
  const health = await adminService.getDetailedSystemHealth();
  sendSuccess(res, health);
}
