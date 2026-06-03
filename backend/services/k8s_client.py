from kubernetes import client, config

class KubernetesClient:
    def __init__(self):
        try:
            config.load_kube_config()
        except Exception:
            config.load_incluster_config()
        self.apps_v1 = client.AppsV1Api()

    async def scale_deployment(self, name: str, namespace: str, replicas: int):
        body = {"spec": {"replicas": replicas}}
        self.apps_v1.patch_namespaced_deployment_scale(name, namespace, body)
        return {"scaled_to": replicas}

    async def get_deployment(self, name: str, namespace: str):
        return self.apps_v1.read_namespaced_deployment(name, namespace)

    async def list_deployments(self, namespace: str = "default"):
        return self.apps_v1.list_namespaced_deployment(namespace)