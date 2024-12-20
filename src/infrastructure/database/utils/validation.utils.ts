import { Model } from 'mongoose';
import { logger } from '../../logging';

export const validateId = async <T>(
  model: Model<T>,
  id: string
): Promise<boolean> => {
  try {
    const doc = await model.findById(id);
    return !!doc;
  } catch (error) {
    logger.error('Error validating document ID:', error);
    return false;
  }
};

export const validateUniqueField = async <T>(
  model: Model<T>,
  field: string,
  value: any
): Promise<boolean> => {
  try {
    const doc = await model.findOne({ [field]: value });
    return !doc;
  } catch (error) {
    logger.error('Error validating unique field:', error);
    return false;
  }
};