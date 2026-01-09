import { describe, it, expectTypeOf } from 'vitest';
import { get } from '../index';

describe('Duplicate Params Detection', () => {
  it('should not allow duplicate params in path', () => {
    // Correct usage
    get('/products/{id}/details');
    get('/products/{id}/items/{itemId}');

    // Incorrect usage - should cause type error
    // @ts-expect-error
    get('/products/{id}/items/{id}');
    
    // Check error message type (conceptually)
    // The type of the argument expected is 'Error: Duplicate param 'id''
    // So passing the string '/products/{id}/items/{id}' fails assignment.
  });
});
