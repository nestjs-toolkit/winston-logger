import { ActivityBuilder } from './activity.builder';
import { CauserActivity } from '../types';

describe('Activity Log', function() {
  const loggerInfo = jest.fn();

  const loggerMock: any = jest.fn().mockImplementation(() => {
    return { log: loggerInfo };
  });

  const activity = (): ActivityBuilder => {
    return new ActivityBuilder(loggerMock());
  };

  beforeEach(() => {
    loggerInfo.mockClear();
  });

  it('log', async function() {
    activity().log('Foo');

    expect(loggerInfo).toHaveBeenCalledTimes(1);
    expect(loggerInfo).lastCalledWith('data', 'Foo', {});
  });

  it('present', function() {
    const result = activity().present('Foo');

    expect(result).toStrictEqual({
      message: 'Foo',
      meta: {},
    });
  });

  it('message placeholder', function() {
    class Person {
      public type = 'person';

      constructor(public _id: string, public name: string) {}
    }

    const anModel = new Person('0001', 'Leia');
    const user: CauserActivity = {
      _id: '123456',
      username: 'Luke',
    };

    const { message } = activity()
      .performedOn(anModel)
      .causedBy(user)
      .level('warn')
      .tags(['first-tag', 'backend', 'admin'])
      .action('category.create')
      .env('production')
      .withProperties({ customProperty: 'customValue' })
      .withProperties({ framework: 'nestjs' })
      .withProperty('version', 'v7.0')
      .withProperty('demo', { foo: 'bar' })
      .present(
        'The subject name is :subject.name, the causer name is :causer.username and framework is :properties.framework :properties.version, demo :properties.demo.foo',
      );

    expect(message).toBe(
      'The subject name is Leia, the causer name is Luke and framework is nestjs v7.0, demo bar',
    );
  });

  it('add tags from array', function() {
    const { meta } = activity()
      .tags(['first-tag', 'backend', 'admin'])
      .action('category.create')
      .present('message');

    expect(meta.properties.tags).toStrictEqual([
      'first-tag',
      'backend',
      'admin',
    ]);
  });

  it('add single tags', function() {
    const { meta } = activity()
      .tags('first-tag')
      .action('category.create')
      .present('message');

    expect(meta.properties.tags).toStrictEqual(['first-tag']);
  });

  it('add tags from arguments', function() {
    const { meta } = activity()
      .tags('first-tag', 'backend', 'admin')
      .action('category.create')
      .present('message');

    expect(meta.properties.tags).toStrictEqual([
      'first-tag',
      'backend',
      'admin',
    ]);
  });
});
