from models.plan import ExecutionPlan

def check_replica_limit(plan: ExecutionPlan):
    """Never scale above 20 replicas"""
    replicas = plan.intent.parameters.get('replicas')
    if replicas and int(replicas) > 20:
        return f'Replica limit exceeded: {replicas} > 20'
    return None

def check_no_delete_in_production(plan: ExecutionPlan):
    """Block remove_service in default/production namespace"""
    if plan.intent.action == 'remove_service':
        if plan.intent.namespace in ('default', 'production'):
            return 'Cannot remove services from production/default namespace'
    return None

def check_scale_to_zero(plan: ExecutionPlan):
    """Scaling to 0 replicas takes the service offline"""
    replicas = plan.intent.parameters.get('replicas')
    if replicas is not None and int(replicas) == 0:
        return 'Scaling to 0 replicas would take the service offline'
    return None

ALL_RULES = [
    check_replica_limit,
    check_no_delete_in_production,
    check_scale_to_zero,
]