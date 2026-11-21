import type { Request, Response } from 'express';
import * as svc from '../services/profile.service';
import { sendSuccess } from '../utils/apiResponse';

const uid = (req: Request) => req.user!.id;

export const getCandidate = async (req: Request, res: Response) =>
  sendSuccess(res, { profile: await svc.getCandidate(uid(req)) });

export const updateCandidate = async (req: Request, res: Response) =>
  sendSuccess(res, { profile: await svc.updateCandidate(uid(req), req.body) });

export const setSkills = async (req: Request, res: Response) =>
  sendSuccess(res, { profile: await svc.setSkills(uid(req), req.body.skills) });

function entryHandlers(key: 'experience' | 'education') {
  return {
    add: async (req: Request, res: Response) =>
      sendSuccess(res, { profile: await svc.addEntry(uid(req), key, req.body) }, 201),
    update: async (req: Request, res: Response) =>
      sendSuccess(res, { profile: await svc.updateEntry(uid(req), key, String(req.params.entryId), req.body) }),
    remove: async (req: Request, res: Response) =>
      sendSuccess(res, { profile: await svc.removeEntry(uid(req), key, String(req.params.entryId)) }),
  };
}
export const experience = entryHandlers('experience');
export const education = entryHandlers('education');

export const getRecruiter = async (req: Request, res: Response) =>
  sendSuccess(res, { profile: await svc.getRecruiter(uid(req)) });

export const updateRecruiter = async (req: Request, res: Response) =>
  sendSuccess(res, { profile: await svc.updateRecruiter(uid(req), req.body) });
