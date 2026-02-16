#pragma once
#include <queue>
#include <mutex>
#include <condition_variable>
#include <functional>
#include <chrono>
#include <vector>

struct Task
{
    std::function<void()> callback;
    std::chrono::steady_clock::time_point scheduledTime;
    bool operator>(const Task& other) const {
        return scheduledTime > other.scheduledTime;
    }
};

class EventLoop
{
private:
    std::priority_queue<Task, std::vector<Task>, std::greater<Task>> taskQueue;
    std::mutex queueMutex;
    std::condition_variable cv;
    bool running = true;

public:
    void schedule(std::function<void()> callback, int delayMs = 0);
    void processNext();
    void runUntilEmpty();
    bool hasTasksScheduled();
};