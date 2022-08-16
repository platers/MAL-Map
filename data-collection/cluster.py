import networkx as nx
from cdlib import algorithms, evaluation
import json
import sys


def loadGraph(fileName):
    # Load edges from file in format:
    #   <node1> <node2> <weight>
    # into a networkx graph
    G = nx.Graph()
    with open(fileName) as f:
        for line in f:
            node1, node2, weight = line.split()
            G.add_edge(node1, node2, weight=float(weight))
    return G


def getComs(G):
    coms = algorithms.infomap(G)
    return coms


class Cluster:
    max_id = 0

    def __init__(self, G, tier=0):
        self.G = G
        self.tier = tier
        self.id = Cluster.max_id
        nodes = list(G.nodes)
        print("Cluster {}: {} nodes".format(self.id, len(nodes)))
        Cluster.max_id += 1
        self.clusters = []
        self.nodes = []

        if len(G.nodes) < 15:
            self.nodes = nodes
            return

        coms = getComs(G)
        partitions = coms.communities
        if len(partitions) == 1:
            self.nodes = nodes
            return

        self.clusters = list(
            map(lambda x: Cluster(G.subgraph(x), tier + 1), partitions)
        )

    def __dict__(self):
        return {
            "id": self.id,
            "tier": self.tier,
            "nodes": list(map(lambda x: int(x), self.nodes)),
            "clusters": list(map(lambda x: x.__dict__(), self.clusters)),
        }

    def toJSON(self):
        return json.dumps(self.__dict__())


if __name__ == "__main__":
    G = loadGraph(sys.argv[1])
    coms = getComs(G)
    print(len(coms.communities), list(map(len, coms.communities)))
    print(evaluation.z_modularity(G, coms))
    C = Cluster(G)

    # Write to file
    with open(sys.argv[2], "w") as f:
        f.write(C.toJSON())
